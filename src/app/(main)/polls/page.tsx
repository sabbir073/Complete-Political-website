'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import PhoneVerification from '@/components/auth/PhoneVerification';
import Link from 'next/link';

interface PollOption {
  id: string;
  option_en: string;
  option_bn: string;
  display_order: number;
  vote_count?: number;
  percentage?: number;
}

interface Poll {
  id: string;
  title_en: string;
  title_bn: string;
  description_en?: string;
  description_bn?: string;
  status: string;
  computed_status: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  total_votes: number;
  show_results_before_end: boolean;
  require_verification: boolean;
  poll_options: PollOption[];
  can_vote?: boolean;
  has_voted?: boolean;
  voted_option_id?: string;
}

// Saved voter hash in localStorage
const VOTER_HASH_KEY = 'voter_phone_hash';

export default function PollsPage() {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [voterHash, setVoterHash] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);

  const getText = useCallback(
    (textEn: string, textBn?: string) => {
      if (language === 'bn' && textBn) return textBn;
      return textEn;
    },
    [language]
  );

  // Load voter hash from localStorage on mount
  useEffect(() => {
    const savedHash = localStorage.getItem(VOTER_HASH_KEY);
    if (savedHash) {
      setVoterHash(savedHash);
    }
  }, []);

  // Fetch polls
  useEffect(() => {
    fetchPolls();
  }, [voterHash]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const url = voterHash
        ? `/api/polls?voter_hash=${encodeURIComponent(voterHash)}`
        : '/api/polls';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPolls(data.data);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePoll = async (pollId: string): Promise<Poll | null> => {
    try {
      const url = voterHash
        ? `/api/polls/${pollId}?voter_hash=${encodeURIComponent(voterHash)}`
        : `/api/polls/${pollId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching poll:', error);
      return null;
    }
  };

  const handleOpenPoll = async (poll: Poll) => {
    const detailedPoll = await fetchSinglePoll(poll.id);
    if (detailedPoll) {
      setSelectedPoll(detailedPoll);
      setShowVoteModal(true);
      setSelectedOption(null);
      setVoteError(null);
      setVoteSuccess(false);
    }
  };

  const handleVote = async () => {
    if (!selectedPoll || !selectedOption) return;

    // Check if verification is required and voter hasn't verified yet
    if (selectedPoll.require_verification && !voterHash) {
      setShowPhoneVerification(true);
      return;
    }

    await submitVote();
  };

  const submitVote = async () => {
    if (!selectedPoll || !selectedOption) return;

    setVoting(true);
    setVoteError(null);

    try {
      const response = await fetch(`/api/polls/${selectedPoll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_id: selectedOption,
          voter_phone_hash: voterHash,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVoteSuccess(true);
        // Update the poll with new results
        if (data.data) {
          setSelectedPoll((prev) =>
            prev
              ? {
                  ...prev,
                  has_voted: true,
                  voted_option_id: selectedOption,
                  total_votes: data.data.total_votes,
                  poll_options: data.data.options,
                }
              : null
          );
        }
        // Refresh the polls list
        fetchPolls();
      } else {
        setVoteError(
          data.error ||
            (language === 'bn' ? 'ভোট দিতে ব্যর্থ হয়েছে' : 'Failed to submit vote')
        );
        if (data.already_voted) {
          // Update local state to reflect already voted
          setSelectedPoll((prev) =>
            prev
              ? { ...prev, has_voted: true, voted_option_id: data.voted_option_id }
              : null
          );
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      setVoteError(
        language === 'bn' ? 'ভোট দিতে ব্যর্থ হয়েছে' : 'Failed to submit vote'
      );
    } finally {
      setVoting(false);
    }
  };

  const handlePhoneVerified = async (phoneHash: string) => {
    // Save the hash to localStorage
    localStorage.setItem(VOTER_HASH_KEY, phoneHash);
    setVoterHash(phoneHash);
    setShowPhoneVerification(false);

    // Now submit the vote
    setTimeout(() => {
      submitVote();
    }, 100);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {language === 'bn' ? 'চলমান' : 'Open'}
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {language === 'bn' ? 'আসন্ন' : 'Upcoming'}
          </span>
        );
      case 'closed':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {language === 'bn' ? 'সমাপ্ত' : 'Closed'}
          </span>
        );
      default:
        return null;
    }
  };

  const canShowResults = (poll: Poll) => {
    // Show results if:
    // 1. Poll is closed, OR
    // 2. User has voted, OR
    // 3. show_results_before_end is true
    return (
      poll.computed_status === 'closed' ||
      poll.has_voted ||
      poll.show_results_before_end
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div
        className={`relative py-16 ${
          isDark
            ? 'bg-gradient-to-r from-green-900 via-green-800 to-green-900'
            : 'bg-gradient-to-r from-green-600 via-green-500 to-green-600'
        }`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'bn' ? 'পোলস এবং সার্ভে' : 'Polls & Surveys'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'আপনার মতামত গুরুত্বপূর্ণ। চলমান পোলগুলোতে অংশ নিন এবং আপনার মতামত জানান।'
              : 'Your opinion matters. Participate in ongoing polls and share your views.'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : polls.length === 0 ? (
          <div
            className={`text-center py-20 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-lg">
              {language === 'bn'
                ? 'কোনো চলমান পোল নেই'
                : 'No active polls at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className={`
                  rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl
                  ${isDark ? 'bg-gray-800' : 'bg-white'}
                `}
              >
                {/* Card Header */}
                <div
                  className={`p-4 ${
                    poll.computed_status === 'active'
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : poll.computed_status === 'scheduled'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    {getStatusBadge(poll.computed_status)}
                    {poll.has_voted && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-white/20 text-white flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {language === 'bn' ? 'ভোট দেওয়া হয়েছে' : 'Voted'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Clickable Title - navigates to single poll page */}
                  <Link href={`/polls/${poll.id}`}>
                    <h3
                      className={`text-lg font-bold mb-2 line-clamp-2 hover:underline cursor-pointer ${
                        isDark ? 'text-white hover:text-green-400' : 'text-gray-900 hover:text-green-600'
                      }`}
                    >
                      {getText(poll.title_en, poll.title_bn)}
                    </h3>
                  </Link>

                  {(poll.description_en || poll.description_bn) && (
                    <p
                      className={`text-sm mb-4 line-clamp-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {getText(poll.description_en || '', poll.description_bn)}
                    </p>
                  )}

                  {/* Datetime */}
                  <div
                    className={`text-xs space-y-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {poll.computed_status === 'scheduled'
                          ? `${language === 'bn' ? 'শুরু:' : 'Starts:'} ${formatDateTime(
                              poll.start_datetime
                            )}`
                          : `${language === 'bn' ? 'শেষ:' : 'Ends:'} ${formatDateTime(
                              poll.end_datetime
                            )}`}
                      </span>
                    </div>
                  </div>

                  {/* Total votes (only if results can be shown) */}
                  {canShowResults(poll) && (
                    <div
                      className={`mt-4 pt-4 border-t ${
                        isDark ? 'border-gray-700' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {language === 'bn' ? 'মোট ভোট' : 'Total Votes'}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            isDark ? 'text-green-400' : 'text-green-600'
                          }`}
                        >
                          {poll.total_votes.toLocaleString(
                            language === 'bn' ? 'bn-BD' : 'en-US'
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    {/* Vote Now Button - opens voting popup */}
                    {poll.computed_status === 'active' && !poll.has_voted && (
                      <button
                        onClick={() => handleOpenPoll(poll)}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        {language === 'bn' ? 'ভোট দিন' : 'Vote Now'}
                      </button>
                    )}

                    {/* View Results Button - for voted/closed polls */}
                    {(poll.has_voted || poll.computed_status === 'closed') && (
                      <button
                        onClick={() => handleOpenPoll(poll)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                          isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        {language === 'bn' ? 'ফলাফল দেখুন' : 'View Results'}
                      </button>
                    )}

                    {/* View Details Link - always visible */}
                    <Link
                      href={`/polls/${poll.id}`}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1 ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Scheduled poll notice */}
                  {poll.computed_status === 'scheduled' && (
                    <div className="mt-4 text-center">
                      <span
                        className={`text-sm font-medium ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        {language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedPoll && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVoteModal(false)}
          />

          <div
            className={`
            relative w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl flex flex-col
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}
          >
            {/* Modal Header */}
            <div
              className={`flex-shrink-0 p-6 border-b rounded-t-2xl ${
                isDark
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <button
                onClick={() => setShowVoteModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(selectedPoll.computed_status)}
                {selectedPoll.has_voted && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {language === 'bn' ? 'আপনি ভোট দিয়েছেন' : "You've voted"}
                  </span>
                )}
              </div>

              <h2
                className={`text-xl font-bold pr-8 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {getText(selectedPoll.title_en, selectedPoll.title_bn)}
              </h2>

              {(selectedPoll.description_en || selectedPoll.description_bn) && (
                <p
                  className={`text-sm mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {getText(
                    selectedPoll.description_en || '',
                    selectedPoll.description_bn
                  )}
                </p>
              )}

              {/* Datetime info */}
              <div
                className={`flex flex-wrap gap-4 mt-3 text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{language === 'bn' ? 'শুরু:' : 'Start:'}</span>
                  <span>{formatDateTime(selectedPoll.start_datetime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{language === 'bn' ? 'শেষ:' : 'End:'}</span>
                  <span>{formatDateTime(selectedPoll.end_datetime)}</span>
                </div>
              </div>
            </div>

            {/* Modal Body - Options */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Error message */}
              {voteError && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                  {voteError}
                </div>
              )}

              {/* Success message */}
              {voteSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {language === 'bn'
                    ? 'আপনার ভোট সফলভাবে গ্রহণ করা হয়েছে!'
                    : 'Your vote has been recorded successfully!'}
                </div>
              )}

              {/* Options list */}
              <div className="space-y-3">
                {selectedPoll.poll_options?.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const isVoted = selectedPoll.voted_option_id === option.id;
                  const showResults = canShowResults(selectedPoll);
                  const percentage = option.percentage || 0;

                  return (
                    <div
                      key={option.id}
                      onClick={() => {
                        if (
                          selectedPoll.computed_status === 'active' &&
                          !selectedPoll.has_voted
                        ) {
                          setSelectedOption(option.id);
                        }
                      }}
                      className={`
                        relative overflow-hidden rounded-xl transition-all cursor-pointer
                        ${
                          selectedPoll.computed_status === 'active' &&
                          !selectedPoll.has_voted
                            ? 'cursor-pointer'
                            : 'cursor-default'
                        }
                        ${
                          isSelected
                            ? 'ring-2 ring-green-500'
                            : isVoted
                            ? 'ring-2 ring-green-500'
                            : ''
                        }
                        ${
                          isDark
                            ? 'bg-gray-700 hover:bg-gray-650'
                            : 'bg-gray-100 hover:bg-gray-150'
                        }
                      `}
                    >
                      {/* Progress bar background (only when showing results) */}
                      {showResults && (
                        <div
                          className={`absolute inset-0 transition-all duration-500 ${
                            isVoted
                              ? 'bg-green-500/20'
                              : isDark
                              ? 'bg-gray-600'
                              : 'bg-gray-200'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="relative p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Radio/Check indicator */}
                          <div
                            className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${
                              isSelected || isVoted
                                ? 'border-green-500 bg-green-500'
                                : isDark
                                ? 'border-gray-500'
                                : 'border-gray-400'
                            }
                          `}
                          >
                            {(isSelected || isVoted) && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>

                          <span
                            className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {getText(option.option_en, option.option_bn)}
                          </span>
                        </div>

                        {/* Vote count and percentage (when showing results) */}
                        {showResults && (
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {percentage}%
                            </div>
                            <div
                              className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {(option.vote_count || 0).toLocaleString(
                                language === 'bn' ? 'bn-BD' : 'en-US'
                              )}{' '}
                              {language === 'bn' ? 'ভোট' : 'votes'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total votes (when showing results) */}
              {canShowResults(selectedPoll) && (
                <div
                  className={`mt-6 pt-4 border-t text-center ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {language === 'bn' ? 'মোট ভোট: ' : 'Total votes: '}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}
                  >
                    {selectedPoll.total_votes.toLocaleString(
                      language === 'bn' ? 'bn-BD' : 'en-US'
                    )}
                  </span>
                </div>
              )}

              {/* Vote button (only for active polls where user hasn't voted) */}
              {selectedPoll.computed_status === 'active' &&
                !selectedPoll.has_voted &&
                !voteSuccess && (
                  <button
                    onClick={handleVote}
                    disabled={!selectedOption || voting}
                    className={`
                    w-full mt-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                    ${
                      !selectedOption || voting
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }
                  `}
                  >
                    {voting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {language === 'bn' ? 'ভোট দিন' : 'Submit Vote'}
                      </>
                    )}
                  </button>
                )}

              {/* Phone verification required notice */}
              {selectedPoll.require_verification && !voterHash && (
                <p
                  className={`mt-4 text-center text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <svg
                    className="w-4 h-4 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {language === 'bn'
                    ? 'ভোট দিতে ফোন যাচাইকরণ প্রয়োজন'
                    : 'Phone verification required to vote'}
                </p>
              )}

              {/* Message for scheduled polls */}
              {selectedPoll.computed_status === 'scheduled' && (
                <div
                  className={`mt-6 p-4 rounded-xl text-center ${
                    isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {language === 'bn'
                      ? 'এই পোল এখনো শুরু হয়নি'
                      : 'This poll has not started yet'}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? 'text-blue-400/70' : 'text-blue-500'
                    }`}
                  >
                    {language === 'bn' ? 'শুরু হবে: ' : 'Starts on: '}
                    {formatDateTime(selectedPoll.start_datetime)}
                  </p>
                </div>
              )}

              {/* Message for closed polls without results shown */}
              {selectedPoll.computed_status === 'closed' &&
                !canShowResults(selectedPoll) && (
                  <div
                    className={`mt-6 p-4 rounded-xl text-center ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {language === 'bn'
                        ? 'এই পোলটি সমাপ্ত হয়েছে'
                        : 'This poll has ended'}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      <PhoneVerification
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerified={handlePhoneVerified}
        title={{
          en: 'Verify to Vote',
          bn: 'ভোট দিতে যাচাই করুন',
        }}
        description={{
          en: 'Enter your phone number to verify your identity',
          bn: 'আপনার পরিচয় যাচাই করতে ফোন নম্বর দিন',
        }}
      />
    </div>
  );
}
