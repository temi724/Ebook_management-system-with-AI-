import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: '',
        department: '',
        description: '',
        total_copies: 1,
        publication_year: new Date().getFullYear(),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'total_copies' || name === 'publication_year' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onBookAdded(formData);
            // Reset form
            setFormData({
                title: '',
                author: '',
                isbn: '',
                publisher: '',
                category: '',
                department: '',
                description: '',
                total_copies: 1,
                publication_year: new Date().getFullYear(),
            });
            onClose();
        } catch (error) {
            console.error('Error adding book:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-display font-bold text-gray-900">Add New Book</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Title *"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter book title"
                            required
                        />
                        <Input
                            label="Author *"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="Enter author name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="ISBN"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            placeholder="Enter ISBN"
                        />
                        <Input
                            label="Publisher"
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                            placeholder="Enter publisher"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g., Fiction, Science, History"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                            >
                                <option value="">Select department (optional)</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Medicine & Health Sciences">Medicine &amp; Health Sciences</option>
                                <option value="Law">Law</option>
                                <option value="Business Administration">Business Administration</option>
                                <option value="Economics">Economics</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Arts & Humanities">Arts &amp; Humanities</option>
                                <option value="Social Sciences">Social Sciences</option>
                                <option value="Education">Education</option>
                                <option value="Architecture">Architecture</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Publication Year"
                            name="publication_year"
                            type="number"
                            value={formData.publication_year}
                            onChange={handleChange}
                            placeholder="Enter year"
                        />
                        <Input
                            label="Number of Copies *"
                            name="total_copies"
                            type="number"
                            min="1"
                            value={formData.total_copies}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                            placeholder="Enter book description"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                        >
                            Add Book
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBookModal;
