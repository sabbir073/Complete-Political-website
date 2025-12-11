'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { format } from 'date-fns';
import Link from 'next/link';
import SocialShare from '@/components/SocialShare';
import { siteConfig } from '@/lib/seo';

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  icon: string;
}

interface Question {
  id: string;
  category_id: string | null;
  submitter_name_en: string | null;
  submitter_name_bn: string | null;
  submitter_address_en: string | null;
  submitter_address_bn: string | null;
  is_anonymous: boolean;
  question_en: string;
  question_bn: string | null;
  answer_en: string | null;
  answer_bn: string | null;
  answered_at: string | null;
  status: 'approved' | 'answered';
  upvotes: number;
  downvotes: number;
  answer_upvotes: number;
  answer_downvotes: number;
  created_at: string;
  user_vote?: 'upvote' | 'downvote' | null;
  user_answer_vote?: 'upvote' | 'downvote' | null;
  ama_categories: Category | null;
}

interface Props {
  questionId: string;
  initialQuestion: Question | null;
}

export default function AMAQuestionDetailClient({ questionId, initialQuestion }: Props) {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [question, setQuestion] = useState<Question | null>(initialQuestion);
  const [loading, setLoading] = useState(!initialQuestion);

  const getText = (en: string | null, bn: string | null) => {
    if (language === 'bn' && bn) return bn;
    return en || bn || '';
  };

  useEffect(() => {
    if (!initialQuestion) {
      fetchQuestion();
    }
  }, [initialQuestion, questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ama/questions/${questionId}`);
      const data = await res.json();
      if (data.success) {
        setQuestion(data.data);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote', voteTarget: 'question' | 'answer' = 'question') => {
    if (!question) return;

    try {
      const res = await fetch('/api/ama/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id, vote_type: voteType, vote_target: voteTarget })
      });

      const data = await res.json();
      if (data.success) {
        if (voteTarget === 'answer') {
          setQuestion(prev => prev ? {
            ...prev,
            answer_upvotes: data.data.upvotes,
            answer_downvotes: data.data.downvotes,
            user_answer_vote: data.data.user_vote
          } : null);
        } else {
          setQuestion(prev => prev ? {
            ...prev,
            upvotes: data.data.upvotes,
            downvotes: data.data.downvotes,
            user_vote: data.data.user_vote
          } : null);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">404</div>
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'প্রশ্ন পাওয়া যায়নি' : 'Question Not Found'}
          </h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn'
              ? 'আপনি যে প্রশ্নটি খুঁজছেন তা বিদ্যমান নেই।'
              : 'The question you\'re looking for doesn\'t exist.'}
          </p>
          <Link
            href="/ama"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'bn' ? 'সব প্রশ্ন দেখুন' : 'View All Questions'}
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${siteConfig.url}/ama/${question.id}`;
  const shareTitle = getText(question.question_en, question.question_bn).substring(0, 100);
  const shareDescription = getText(question.answer_en, question.answer_bn)?.substring(0, 200) || '';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`relative py-12 ${isDark ? 'bg-gradient-to-br from-green-900 via-gray-900 to-gray-900' : 'bg-gradient-to-br from-green-600 via-green-700 to-green-800'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/ama"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'bn' ? 'সব প্রশ্ন' : 'All Questions'}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {language === 'bn' ? 'প্রশ্ন ও উত্তর' : 'Question & Answer'}
          </h1>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-2xl p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          {/* Category Badge */}
          {question.ama_categories && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              {question.ama_categories.icon} {getText(question.ama_categories.name_en, question.ama_categories.name_bn)}
            </span>
          )}

          {/* Question */}
          <h2 className={`text-xl md:text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {getText(question.question_en, question.question_bn)}
          </h2>

          {/* Submitter Info */}
          <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {question.is_anonymous ? (
              <span>{language === 'bn' ? '👤 বেনামী' : '👤 Anonymous'}</span>
            ) : (
              <>
                <span>👤 {getText(question.submitter_name_en, question.submitter_name_bn)}</span>
                {question.submitter_address_en && (
                  <span>📍 {getText(question.submitter_address_en, question.submitter_address_bn)}</span>
                )}
              </>
            )}
            <span>📅 {formatDate(question.created_at)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              question.status === 'answered'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {question.status === 'answered'
                ? (language === 'bn' ? '✅ উত্তর দেওয়া হয়েছে' : '✅ Answered')
                : (language === 'bn' ? '⏳ অপেক্ষমান' : '⏳ Pending')}
            </span>
          </div>

          {/* Question Vote Buttons */}
          <div className="mt-6 flex items-center gap-4">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {language === 'bn' ? 'প্রশ্নে ভোট:' : 'Vote on question:'}
            </span>
            <button
              onClick={() => handleVote('upvote', 'question')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                question.user_vote === 'upvote'
                  ? 'bg-green-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="font-medium">{question.upvotes}</span>
            </button>

            <button
              onClick={() => handleVote('downvote', 'question')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                question.user_vote === 'downvote'
                  ? 'bg-red-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="font-medium">{question.downvotes}</span>
            </button>
          </div>

          {/* Answer */}
          {question.status === 'answered' && (question.answer_en || question.answer_bn) && (
            <div className={`mt-8 p-6 rounded-xl ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-600 font-bold text-lg">
                  {language === 'bn' ? '💬 উত্তর:' : '💬 Answer:'}
                </span>
                {question.answered_at && (
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(question.answered_at)}
                  </span>
                )}
              </div>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText(question.answer_en, question.answer_bn)}
              </p>

              {/* Answer Vote Buttons */}
              <div className="mt-6 flex items-center gap-4 pt-4 border-t border-green-300/30">
                <span className={`text-sm font-medium ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
                  {language === 'bn' ? 'উত্তরে ভোট:' : 'Vote on answer:'}
                </span>
                <button
                  onClick={() => handleVote('upvote', 'answer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    question.user_answer_vote === 'upvote'
                      ? 'bg-green-600 text-white'
                      : isDark
                        ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="font-medium">{question.answer_upvotes || 0}</span>
                </button>

                <button
                  onClick={() => handleVote('downvote', 'answer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    question.user_answer_vote === 'downvote'
                      ? 'bg-red-600 text-white'
                      : isDark
                        ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="font-medium">{question.answer_downvotes || 0}</span>
                </button>
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'bn' ? 'এই প্রশ্ন-উত্তর শেয়ার করুন:' : 'Share this Q&A:'}
              </span>
              <SocialShare
                url={shareUrl}
                title={shareTitle}
                description={shareDescription}
                variant="icons"
                size="md"
                showLabel={false}
              />
            </div>
          </div>
        </div>

        {/* Back to All Questions */}
        <div className="mt-8 text-center">
          <Link
            href="/ama"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'bn' ? 'সব প্রশ্ন দেখুন' : 'View All Questions'}
          </Link>
        </div>
      </div>
    </div>
  );
}
