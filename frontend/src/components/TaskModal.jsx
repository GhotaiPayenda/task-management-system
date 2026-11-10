import { useState } from 'react';
import taskService from '../services/taskService';
import { getErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import Modal from './Modal';
import TaskForm from './TaskForm';

export default function TaskModal({ open, task, categories, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const isEditing = Boolean(task);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (isEditing) {
        await taskService.update(task.id, payload);
        toast.success('Task updated successfully.');
      } else {
        await taskService.create(payload);
        toast.success('Task created successfully.');
      }
      onSaved();
      onClose();
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Could not save the task.');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={isEditing ? 'Edit task' : 'Create a new task'}
      subtitle={isEditing ? 'Update the details and keep your team aligned.' : 'Capture the work, set a deadline, and keep moving.'}
      size="lg"
    >
      <TaskForm
        key={task?.id || 'new'}
        task={task}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitting={submitting}
        error={error}
      />
    </Modal>
  );
}
