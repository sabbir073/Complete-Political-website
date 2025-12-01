'use client';

import dynamic from 'next/dynamic';
import { forwardRef, useMemo, useRef, useState, useCallback } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import { useMediaSelector } from '@/components/media/MediaSelector';
import { MediaItem } from '@/types/media.types';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        const { default: QuillResizeImage } = await import('quill-resize-image');

        // Register the resize module
        const Quill = RQ.Quill;
        Quill.register('modules/resize', QuillResizeImage);

        // Wrap with forwardRef to support ref
        const QuillWrapper = forwardRef((props: any, ref: any) => <RQ ref={ref} {...props} />);
        QuillWrapper.displayName = 'ReactQuill';
        return QuillWrapper;
    },
    {
        ssr: false,
        loading: () => (
            <div className="h-64 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        ),
    }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write your content here...',
    className = '',
    minHeight = '300px',
}: RichTextEditorProps) {
    const quillRef = useRef<any>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    // Media selector hook for image selection from library
    const { openSelector, MediaSelectorComponent } = useMediaSelector();

    // Custom image handler to open media library
    const imageHandler = () => {
        openSelector({
            multiple: false,
            fileType: 'image',
            title: 'Select Image for Editor',
            onSelect: (media) => {
                const mediaItem = Array.isArray(media) ? media[0] : media as MediaItem;
                if (mediaItem) {
                    const imageUrl = mediaItem.cloudfront_url || mediaItem.s3_url;
                    insertImageToEditor(imageUrl);
                }
            }
        });
    };

    // Insert image into editor at cursor position
    const insertImageToEditor = (url: string) => {
        const editor = quillRef.current?.getEditor();
        if (editor && url) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1);
        }
    };

    // Custom video handler to open modal
    const videoHandler = () => {
        setVideoUrl('');
        setShowVideoModal(true);
    };

    // Insert video from URL
    const insertVideo = () => {
        const editor = quillRef.current?.getEditor();
        if (editor && videoUrl) {
            const range = editor.getSelection(true);

            // Check if it's a YouTube URL and convert to embed
            let embedUrl = videoUrl;
            const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
            if (youtubeMatch) {
                embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
            }

            // Insert video embed
            editor.insertEmbed(range.index, 'video', embedUrl);
            editor.setSelection(range.index + 1);
        }
        setShowVideoModal(false);
        setVideoUrl('');
    };

    // Toolbar configuration with all formatting options
    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    // Font and size
                    [{ font: [] }],
                    [{ size: ['small', false, 'large', 'huge'] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],

                    // Text formatting
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ color: [] }, { background: [] }],
                    [{ script: 'sub' }, { script: 'super' }],

                    // Alignment and lists
                    [{ align: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ indent: '-1' }, { indent: '+1' }],

                    // Block elements
                    ['blockquote', 'code-block'],
                    [{ direction: 'rtl' }],

                    // Media and links
                    ['link', 'image', 'video'],

                    // Clean
                    ['clean'],
                ],
                handlers: {
                    image: imageHandler,
                    video: videoHandler,
                },
            },
            resize: {
                locale: {},
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        []
    );

    // Supported formats
    const formats = [
        'font',
        'size',
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'script',
        'align',
        'list',
        'indent',
        'blockquote',
        'code-block',
        'direction',
        'link',
        'image',
        'video',
    ];

    return (
        <div className={`rich-text-editor ${className}`}>
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    min-height: ${minHeight};
                    font-size: 16px;
                }
                .rich-text-editor .ql-editor {
                    min-height: ${minHeight};
                }
                .rich-text-editor .ql-toolbar {
                    background: #f9fafb;
                    border-color: #d1d5db;
                    border-radius: 0.5rem 0.5rem 0 0;
                    flex-wrap: wrap;
                }
                .rich-text-editor .ql-container {
                    border-color: #d1d5db;
                    border-radius: 0 0 0.5rem 0.5rem;
                    background: white;
                }
                .dark .rich-text-editor .ql-toolbar {
                    background: #374151;
                    border-color: #4b5563;
                }
                .dark .rich-text-editor .ql-container {
                    background: #1f2937;
                    border-color: #4b5563;
                }
                .dark .rich-text-editor .ql-editor {
                    color: white;
                }
                .dark .rich-text-editor .ql-toolbar button,
                .dark .rich-text-editor .ql-toolbar .ql-picker-label {
                    color: #d1d5db;
                }
                .dark .rich-text-editor .ql-toolbar button:hover,
                .dark .rich-text-editor .ql-toolbar .ql-picker-label:hover {
                    color: white;
                }
                .dark .rich-text-editor .ql-toolbar button.ql-active,
                .dark .rich-text-editor .ql-toolbar .ql-picker-label.ql-active {
                    color: #ef4444;
                }
                .dark .rich-text-editor .ql-toolbar .ql-stroke {
                    stroke: #d1d5db;
                }
                .dark .rich-text-editor .ql-toolbar .ql-fill {
                    fill: #d1d5db;
                }
                .dark .rich-text-editor .ql-toolbar button:hover .ql-stroke,
                .dark .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
                    stroke: #ef4444;
                }
                .dark .rich-text-editor .ql-toolbar button:hover .ql-fill,
                .dark .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
                    fill: #ef4444;
                }
                .dark .rich-text-editor .ql-picker-options {
                    background: #374151;
                    border-color: #4b5563;
                }
                .dark .rich-text-editor .ql-picker-item {
                    color: #d1d5db;
                }
                .dark .rich-text-editor .ql-picker-item:hover {
                    color: white;
                    background: #4b5563;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                }
                .rich-text-editor .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                    cursor: pointer;
                }
                .rich-text-editor .ql-editor iframe,
                .rich-text-editor .ql-editor video {
                    max-width: 100%;
                    width: 100%;
                    aspect-ratio: 16/9;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
                .rich-text-editor .ql-snow .ql-tooltip {
                    z-index: 1000;
                }
                /* Image resize styles */
                .ql-editor img.ql-resize-active {
                    outline: 2px solid #3b82f6;
                }
                .ql-resize-handle {
                    background-color: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    width: 12px;
                    height: 12px;
                }
            `}</style>

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />

            {/* Media Library Selector for Images */}
            {MediaSelectorComponent}

            {/* Video URL Modal */}
            {showVideoModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold dark:text-white">Insert Video</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Embed a video from YouTube or other sources</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                    Video URL
                                </label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            insertVideo();
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-2">Supported formats:</p>
                                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                        YouTube (youtube.com/watch?v=... or youtu.be/...)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        Direct video embed URLs
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowVideoModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={insertVideo}
                                disabled={!videoUrl}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                Insert Video
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
