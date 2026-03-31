const { rtdb } = require('../config/firebase');

// Helper to check for circular dependencies using DFS
const hasCycle = async (predecessorId, successorId) => {
  const visited = new Set();
  const queue = [predecessorId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (currentId === successorId) return true;

    const depsSnapshot = await rtdb.ref('dependencies').orderByChild('successor').equalTo(currentId).once('value');
    if (depsSnapshot.exists()) {
      const depsData = depsSnapshot.val();
      for (const key in depsData) {
        const predId = depsData[key].predecessor;
        if (!visited.has(predId)) {
          visited.add(predId);
          queue.push(predId);
        }
      }
    }
  }
  return false;
};

// Helper to update task status based on its predecessors
const evaluateTaskStatus = async (taskId) => {
  const depsSnapshot = await rtdb.ref('dependencies').orderByChild('successor').equalTo(taskId).once('value');
  
  if (!depsSnapshot.exists()) {
    const taskRef = rtdb.ref(`tasks/${taskId}`);
    const taskSnapshot = await taskRef.once('value');
    if (taskSnapshot.exists() && taskSnapshot.val().status === 'blocked') {
      await taskRef.update({ status: 'in-progress', blockedReason: '' });
    }
    return;
  }

  let isBlocked = false;
  let reason = '';

  const depsData = depsSnapshot.val();
  for (const key in depsData) {
    const dep = depsData[key];
    const predSnapshot = await rtdb.ref(`tasks/${dep.predecessor}`).once('value');
    
    if (predSnapshot.exists()) {
      const pred = predSnapshot.val();
      const threshold = dep.type === 'full' ? 100 : dep.threshold;

      if (pred.progress < threshold) {
        isBlocked = true;
        reason = `Blocked by ${pred.title} (Needs ${threshold}% progress, currently ${pred.progress}%)`;
        break;
      }
    }
  }

  const taskRef = rtdb.ref(`tasks/${taskId}`);
  const taskSnapshot = await taskRef.once('value');
  if (taskSnapshot.exists()) {
    const taskData = taskSnapshot.val();
    const currentStatus = taskData.status;
    const newStatus = isBlocked ? 'blocked' : (taskData.progress === 100 ? 'done' : 'in-progress');
    
    if (currentStatus !== newStatus || taskData.blockedReason !== reason) {
      await taskRef.update({ 
        status: newStatus, 
        blockedReason: isBlocked ? reason : '' 
      });
      
      // If this task's status changed, it might affect ITS successors
      if (!isBlocked) {
         await cascadeUpdates(taskId);
      }
    }
  }
};

// Cascade updates to all successors
const cascadeUpdates = async (taskId) => {
  const downstreamSnapshot = await rtdb.ref('dependencies').orderByChild('predecessor').equalTo(taskId).once('value');
  if (downstreamSnapshot.exists()) {
    const downstreamData = downstreamSnapshot.val();
    for (const key in downstreamData) {
      await evaluateTaskStatus(downstreamData[key].successor);
    }
  }
};

exports.createTask = async (req, res) => {
  try {
    const tasksRef = rtdb.ref('tasks');
    const newTaskRef = tasksRef.push();
    const task = {
      ...req.body,
      id: newTaskRef.key,
      progress: 0,
      status: 'in-progress',
      createdAt: new Date().toISOString()
    };
    await newTaskRef.set(task);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasksSnapshot = await rtdb.ref('tasks').once('value');
    if (!tasksSnapshot.exists()) return res.json([]);
    
    const tasksData = tasksSnapshot.val();
    const tasks = [];
    
    for (const key in tasksData) {
      const task = tasksData[key];
      // Join with member info
      let assignedMember = null;
      if (task.assignedMember) {
        const memberRef = rtdb.ref(`users/${task.assignedMember}`);
        const memberSnapshot = await memberRef.once('value');
        if (memberSnapshot.exists()) {
          const mData = memberSnapshot.val();
          assignedMember = { _id: memberSnapshot.key, name: mData.name, username: mData.username };
        }
      }
      tasks.push({ _id: key, ...task, assignedMember });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const taskRef = rtdb.ref(`tasks/${req.params.id}`);
    const snapshot = await taskRef.once('value');
    
    if (!snapshot.exists()) return res.status(404).json({ message: 'Task not found' });
    const taskData = snapshot.val();

    // Authorization
    if (req.user.role !== 'admin' && taskData.assignedMember !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updateData = { progress };
    if (progress === 100) updateData.status = 'done';
    else if (taskData.status === 'done') updateData.status = 'in-progress';

    await taskRef.update(updateData);
    
    // Trigger cascade
    await cascadeUpdates(req.params.id);
    
    res.json({ id: req.params.id, ...taskData, ...updateData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addDependency = async (req, res) => {
  try {
    const { predecessor, successor, type, threshold } = req.body;

    if (predecessor === successor) {
      return res.status(400).json({ message: 'Task cannot depend on itself' });
    }

    const isCircular = await hasCycle(predecessor, successor);
    if (isCircular) {
      return res.status(400).json({ message: 'Circular dependency detected' });
    }

    const depRef = rtdb.ref('dependencies').push();
    const dependency = { predecessor, successor, type, threshold: threshold || 100, createdAt: new Date().toISOString() };
    await depRef.set(dependency);

    // Evaluate successor status immediately
    await evaluateTaskStatus(successor);

    res.status(201).json({ id: depRef.key, ...dependency });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDependencies = async (req, res) => {
  try {
    const snapshot = await rtdb.ref('dependencies').once('value');
    if (!snapshot.exists()) return res.json([]);
    
    const depsData = snapshot.val();
    const deps = [];
    
    for (const key in depsData) {
      const dep = depsData[key];
      const [predSnap, succSnap] = await Promise.all([
        rtdb.ref(`tasks/${dep.predecessor}`).once('value'),
        rtdb.ref(`tasks/${dep.successor}`).once('value')
      ]);
      
      deps.push({
        _id: key,
        ...dep,
        predecessor: { _id: predSnap.key, ...predSnap.val() },
        successor: { _id: succSnap.key, ...succSnap.val() }
      });
    }
    res.json(deps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const snapshot = await rtdb.ref('users').once('value');
    if (!snapshot.exists()) return res.json([]);
    
    const usersData = snapshot.val();
    const members = [];
    for (const key in usersData) {
      if (usersData[key].role === 'member') {
        members.push({ _id: key, ...usersData[key] });
      }
    }
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
