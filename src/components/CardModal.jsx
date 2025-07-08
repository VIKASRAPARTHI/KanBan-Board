import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserIcon, 
  PaperClipIcon,
  TrashIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { storage } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

export default function CardModal({ 
  isOpen, 
  onClose, 
  card, 
  onSave, 
  onDelete,
  boardMembers = [] 
}) {
  const [uploading, setUploading] = useState(false)
  const [attachments, setAttachments] = useState(card?.attachments || [])
  
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: card?.title || '',
      description: card?.description || '',
      assignee: card?.assignee || '',
      dueDate: card?.dueDate || '',
      priority: card?.priority || 'medium',
      labels: card?.labels || []
    }
  })

  useEffect(() => {
    if (card) {
      reset({
        title: card.title || '',
        description: card.description || '',
        assignee: card.assignee || '',
        dueDate: card.dueDate || '',
        priority: card.priority || 'medium',
        labels: card.labels || []
      })
      setAttachments(card.attachments || [])
    }
  }, [card, reset])

  const onDrop = async (acceptedFiles) => {
    setUploading(true)
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const fileId = uuidv4()
        const storageRef = ref(storage, `attachments/${fileId}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        return {
          id: fileId,
          name: file.name,
          url: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error(`Failed to upload ${file.name}`)
        return null
      }
    })

    try {
      const uploadedFiles = await Promise.all(uploadPromises)
      const validFiles = uploadedFiles.filter(file => file !== null)
      setAttachments(prev => [...prev, ...validFiles])
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file(s) uploaded successfully`)
      }
    } catch (error) {
      toast.error('Error uploading files')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeAttachment = async (attachmentId) => {
    try {
      const attachment = attachments.find(a => a.id === attachmentId)
      if (attachment) {
        const storageRef = ref(storage, `attachments/${attachmentId}_${attachment.name}`)
        await deleteObject(storageRef)
      }
      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
      toast.success('Attachment removed')
    } catch (error) {
      console.error('Error removing attachment:', error)
      toast.error('Failed to remove attachment')
    }
  }

  const onSubmit = (data) => {
    const updatedCard = {
      ...card,
      ...data,
      attachments,
      updatedAt: new Date().toISOString()
    }
    onSave(updatedCard)
    onClose()
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id)
      onClose()
    }
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={onClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel as={motion.div}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {card ? 'Edit Card' : 'Create Card'}
                      </Dialog.Title>
                      <div className="flex space-x-2">
                        {card && (
                          <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={onClose}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          {...register('title', { required: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Enter card title..."
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          {...register('description')}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                          placeholder="Add a description..."
                        />
                      </div>

                      {/* Priority and Assignee Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select
                            {...register('priority')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignee
                          </label>
                          <select
                            {...register('assignee')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          >
                            <option value="">Unassigned</option>
                            {boardMembers.map(member => (
                              <option key={member.id} value={member.email}>
                                {member.name || member.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          {...register('dueDate')}
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* File Attachments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments
                        </label>
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isDragActive 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <PaperClipIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          {uploading ? (
                            <p className="text-sm text-gray-600">Uploading...</p>
                          ) : isDragActive ? (
                            <p className="text-sm text-indigo-600">Drop files here...</p>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600">
                                Drag & drop files here, or click to select
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Max file size: 10MB
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Attachment List */}
                        {attachments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {attachments.map((attachment) => (
                              <motion.div
                                key={attachment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <DocumentIcon className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {attachment.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(attachment.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          Cancel
                        </button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          {card ? 'Update Card' : 'Create Card'}
                        </motion.button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </AnimatePresence>
  )
}
