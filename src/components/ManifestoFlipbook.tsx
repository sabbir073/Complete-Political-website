'use client';

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTheme } from '@/providers/ThemeProvider';
import { FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress } from 'react-icons/fa';

// Set worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface ManifestoFlipbookProps {
    pdfUrl: string;
}

const ManifestoFlipbook: React.FC<ManifestoFlipbookProps> = ({ pdfUrl }) => {
    const { isDark } = useTheme();
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isMobile, setIsMobile] = useState(false);

    // Zoom & Fullscreen
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Drag to Scroll State
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

    // Resize Observer
    useEffect(() => {
        if (!containerRef.current) return;

        const measure = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;

                // Increase padding to ensure toolbar space at bottom if needed
                const paddingX = 20;
                const paddingY = 60; // More space at bottom for toolbar
                const availableWidth = clientWidth - paddingX;
                const availableHeight = clientHeight - paddingY;

                if (availableWidth <= 0 || availableHeight <= 0) return;

                const containerRatio = availableWidth / availableHeight;
                const PAGE_RATIO = 0.707; // A4 aspect ratio

                const isMobileView = window.innerWidth < 768;
                setIsMobile(isMobileView);

                let newHeight = availableHeight;
                let newWidth = 0;

                if (isMobileView) {
                    // Single Page Mode
                    newWidth = availableWidth;
                    newHeight = newWidth / PAGE_RATIO;
                    if (newHeight > availableHeight) {
                        newHeight = availableHeight;
                        newWidth = newHeight * PAGE_RATIO;
                    }
                } else {
                    // Spread Mode (Desktop)
                    const SPREAD_RATIO = 1.414;
                    if (containerRatio > SPREAD_RATIO) {
                        newHeight = availableHeight;
                        newWidth = newHeight * PAGE_RATIO;
                    } else {
                        newWidth = availableWidth / 2;
                        newHeight = newWidth / PAGE_RATIO;
                    }
                }

                setDimensions({ width: Math.floor(newWidth), height: Math.floor(newHeight) });
            }
        };

        const observer = new ResizeObserver(() => requestAnimationFrame(measure));
        observer.observe(containerRef.current);
        measure();

        return () => observer.disconnect();
    }, []);

    // Fullscreen Listener
    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleNext = () => bookRef.current?.pageFlip().flipNext();
    const handlePrev = () => bookRef.current?.pageFlip().flipPrev();
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));

    const toggleFullscreen = () => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    // --- Drag to Scroll Handler ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        setStartPos({ x: e.pageX, y: e.pageY });
        if (containerRef.current) {
            setScrollPos({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
        }
        e.preventDefault(); // Prevent text selection
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || zoom <= 1 || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX;
        const y = e.pageY;
        // Calculate distance moved
        const walkX = x - startPos.x;
        const walkY = y - startPos.y;

        containerRef.current.scrollLeft = scrollPos.left - walkX;
        containerRef.current.scrollTop = scrollPos.top - walkY;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        if (isDragging) setIsDragging(false);
    };

    // Centering Logic (Desktop only)
    const isCoverOpen = currentPage === 0;
    const shouldCenterCover = isCoverOpen && !isMobile;
    const translateStyle = shouldCenterCover ? { transform: `translateX(-${dimensions.width / 2}px)` } : { transform: 'translateX(0px)' };

    // Calculate Scaled Dimensions for Spacer
    const baseWidth = isMobile ? dimensions.width : dimensions.width * 2;
    const baseHeight = dimensions.height;

    // Extra buffer for comfortable scrolling around edges
    const bufferX = zoom > 1 ? 100 : 0;
    const bufferY = zoom > 1 ? 100 : 0;

    const scaledWidth = (baseWidth * zoom) + bufferX;
    const scaledHeight = (baseHeight * zoom) + bufferY;

    return (
        <div ref={wrapperRef} className={`w-full h-full relative flex flex-col items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'} ${isFullscreen ? 'p-0' : ''}`}>
            <style jsx global>{`
                .react-pdf__Page__canvas {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                }
                .react-pdf__Page {
                    width: 100% !important;
                    height: 100% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>

            <div
                ref={containerRef}
                // REMOVED: items-center justify-center (This was causing the clipping)
                // ADDED: flex only. The child will use margin: auto for centering.
                className={`w-full h-full relative overflow-auto no-scrollbar flex ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* Spacer Div to force scroll overflow */}
                {dimensions.width > 0 && (
                    <div
                        style={{
                            width: zoom === 1 ? '100%' : `${scaledWidth}px`,
                            height: zoom === 1 ? '100%' : `${scaledHeight}px`,
                            minWidth: zoom === 1 ? '100%' : `${scaledWidth}px`,
                            minHeight: zoom === 1 ? '100%' : `${scaledHeight}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'width 0.2s, height 0.2s',
                            // THIS IS THE FIX: margin auto centers it when small, but allows top-left overflow when large
                            margin: 'auto'
                        }}
                    >
                        {/* 
                           Apply pointer-events-none when zoomed so that:
                           1. React-pageflip doesn't receive drag events (stopping the flip)
                           2. Our container receives the mouse events for panning
                        */}
                        <div
                            className={`relative transition-transform duration-200 ease-out origin-center ${zoom > 1 ? 'pointer-events-none' : ''}`}
                            style={{
                                transform: `scale(${zoom})`,
                                ...((zoom === 1) ? translateStyle : {}),
                            }}
                        >
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex items-center justify-center h-full min-h-[400px]">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                                    </div>
                                }
                                className="flex justify-center items-center"
                            >
                                {/* @ts-ignore */}
                                <HTMLFlipBook
                                    key={isMobile ? 'mobile' : 'desktop'}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    size="fixed"
                                    minWidth={200}
                                    maxWidth={2000}
                                    minHeight={300}
                                    maxHeight={2000}
                                    maxShadowOpacity={0.5}
                                    showCover={true}
                                    mobileScrollSupport={true}
                                    onFlip={(e: any) => setCurrentPage(e.data)}
                                    ref={bookRef}
                                    className={`${isDark ? 'shadow-white/5' : 'shadow-black/20'}`}
                                    style={{ margin: '0 auto' }}
                                    usePortrait={isMobile}
                                    startPage={0}
                                    drawShadow={true}
                                    flippingTime={800}
                                    disableFlipByClick={false} // We handle disabling via pointer-events
                                >
                                    {[...Array(numPages)].map((_, index) => (
                                        <div key={`page-${index}`}
                                            className={`demoPage overflow-hidden bg-white ${index === 0 ? 'rounded-r-md' : ''} ${index === numPages - 1 ? 'rounded-l-md' : ''}`}
                                            style={{ width: dimensions.width, height: dimensions.height }}
                                        >
                                            <Page
                                                pageNumber={index + 1}
                                                width={dimensions.width}
                                                className="h-full w-full object-contain"
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                loading={<div className="w-full h-full bg-gray-100/10"></div>}
                                            />
                                        </div>
                                    ))}
                                </HTMLFlipBook>
                            </Document>
                        </div>
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div className={`absolute bottom-6 z-50 flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 rounded-full shadow-xl backdrop-blur-md transition-all border ${isDark ? 'bg-gray-800/90 border-gray-700 text-white' : 'bg-white/90 border-gray-200 text-gray-800'}`}>

                <button onClick={handlePrev} disabled={currentPage === 0} className="p-2 rounded-full hover:bg-gray-500/10 disabled:opacity-30 transition-colors">
                    <FaChevronLeft />
                </button>

                <span className="text-xs sm:text-sm font-medium min-w-[50px] text-center whitespace-nowrap tabular-nums">
                    {currentPage + 1} / {numPages}
                </span>

                <button onClick={handleNext} disabled={currentPage === numPages - 1} className="p-2 rounded-full hover:bg-gray-500/10 disabled:opacity-30 transition-colors">
                    <FaChevronRight />
                </button>

                <div className="w-px h-5 bg-current opacity-20 mx-1"></div>

                <button onClick={handleZoomOut} disabled={zoom <= 1} className="p-2 rounded-full hover:bg-gray-500/10 disabled:opacity-30 transition-colors">
                    <FaSearchMinus />
                </button>

                <span className="text-xs sm:text-sm font-medium w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>

                <button onClick={handleZoomIn} disabled={zoom >= 2.5} className="p-2 rounded-full hover:bg-gray-500/10 disabled:opacity-30 transition-colors">
                    <FaSearchPlus />
                </button>

                <div className="w-px h-5 bg-current opacity-20 mx-1"></div>

                <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
            </div>
        </div>
    );
};

export default ManifestoFlipbook;
