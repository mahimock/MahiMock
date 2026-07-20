import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExamLogo } from '../components/ExamLogo';

interface Exam {
  id: string;
  examName: string;
  slug: string;
  logo?: string;
  logoUrl?: string;
  category: string;
  description?: string;
}

interface SingleExamsCarouselProps {
  exams: Exam[];
  categorySlug: string;
  stats?: Record<string, { total: number, completed: number }>;
  isAdmin?: boolean;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
}

export default function SingleExamsCarousel({ exams, categorySlug, stats = {}, isAdmin, onEdit, onDelete }: SingleExamsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: true,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative group">
      {/* Navigation Arrows - Desktop only or visible on hover */}
      <button 
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="overflow-hidden py-4 select-none" ref={emblaRef} style={{ overscrollBehaviorX: 'contain' }}>
        <div className="flex gap-4 sm:gap-6 pb-4">
          {exams.length > 0 ? exams.map((exam) => {
            const examStats = stats[exam.id] || { total: 0, completed: 0 };
            const progress = examStats.total > 0 
              ? (examStats.completed / examStats.total) * 100 
              : 0;

            return (
              <div 
                key={exam.id} 
                className="flex-[0_0_calc(50%-8px)] sm:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(25%-18px)] xl:flex-[0_0_calc(20%-19.2px)] min-w-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Link 
                  to={`/${categorySlug}/${exam.slug}`}
                  className="block h-full min-h-[200px] sm:min-h-[220px] rounded-[22px] p-5 sm:p-6 flex flex-col shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group bg-gradient-to-br from-[#4A356C] to-[#2F2944] border border-gray-200 dark:border-white/10"
                >
                  {/* Premium Overlays */}
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 backdrop-blur-[2px] pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gray-200 dark:bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
                  
                  {/* Logo Section */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg p-1.5 overflow-hidden mb-4 relative z-10 shrink-0 border-2 border-white/30 group-hover:rotate-6 transition-all duration-500">
                    <ExamLogo logo={exam.logoUrl || exam.logo} name={exam.examName} />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex flex-col flex-1 relative z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white text-[16px] sm:text-[18px] leading-tight mb-1 drop-shadow-md transition-transform group-hover:translate-x-1 duration-500 line-clamp-2">
                      {exam.examName}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#B8B8C8] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/5">
                        SSC
                      </span>
                    </div>
                    
                    {/* Progress Bar (if exists) */}
                    {progress > 0 && (
                      <div className="mt-auto mb-4">
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#A78BFF] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(124,92,255,0.5)]" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Explore Button */}
                    <div className="mt-auto flex items-center justify-between w-full h-9 sm:h-10 px-4 rounded-xl bg-gray-200 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold text-[12px] group-hover:bg-[#7C5CFF] group-hover:border-[#7C5CFF] transition-all duration-300">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-500" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          }) : (
            <div className="w-full py-12 text-center bg-white dark:bg-[#2F2A45] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm">
               <BookOpen className="w-12 h-12 text-gray-900 dark:text-white/20 mx-auto mb-3" />
               <p className="text-gray-900 dark:text-white/50 font-medium">No exams available in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
