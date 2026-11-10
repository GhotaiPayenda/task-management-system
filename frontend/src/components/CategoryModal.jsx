import { useState } from 'react';
import categoryService from '../services/categoryService';
import { getErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import Modal from './Modal';
import CategoryForm from './CategoryForm';

export default function CategoryModal({ open, category, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const isEditing = Boolean(category);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (isEditing) {
        await categoryService.update(category.id, payload);
        toast.success('Category updated successfully.');
      } else {
        await categoryService.create(payload);
        toast.success('Category created successfully.');
      }
      onSaved();
      onClose();
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Could not save the category.');
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
      title={isEditing ? 'Edit category' : 'Create a category'}
      subtitle={isEditing ? 'Rename or refine this category.' : 'Group related tasks so your workspace stays tidy.'}
    >
      <CategoryForm
        key={category?.id || 'new'}
        category={category}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitting={submitting}
        error={error}
      />
    </Modal>
  );
}
