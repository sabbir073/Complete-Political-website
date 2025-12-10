"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";
import PhoneVerification from "@/components/auth/PhoneVerification";
import SocialShare from "@/components/SocialShare";
import Link from "next/link";

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

const VOTER_HASH_KEY = "voter_phone_hash";

interface Props {
  pollId: string;
  initialPoll: Poll | null;
}

export default function PollDetailClient({ pollId, initialPoll }: Props) {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const [poll, setPoll] = useState<Poll | null>(initialPoll);
  const [loading, setLoading] = useState(!initialPoll);
  const [voterHash, setVoterHash] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  const getText = useCallback(
    (textEn: string, textBn?: string) => {
      if (language === "bn" && textBn) return textBn;
      return textEn;
    },
    [language]
  );

  // Load voter hash from localStorage
  useEffect(() => {
    const savedHash = localStorage.getItem(VOTER_HASH_KEY);
    if (savedHash) {
      setVoterHash(savedHash);
    }
  }, []);

  // Fetch poll data
  useEffect(() => {
    if (!initialPoll) {
      fetchPoll();
    }
  }, [pollId, voterHash]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const url = voterHash
        ? `/api/polls/${pollId}?voter_hash=${encodeURIComponent(voterHash)}`
        : `/api/polls/${pollId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPoll(data.data);
      }
    } catch (error) {
      console.error("Error fetching poll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!poll || !selectedOption) return;

    if (poll.require_verification && !voterHash) {
      setShowPhoneVerification(true);
      return;
    }

    await submitVote();
  };

  const submitVote = async () => {
    if (!poll || !selectedOption) return;

    setVoting(true);
    setVoteError(null);

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option_id: selectedOption,
          voter_phone_hash: voterHash,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVoteSuccess(true);
        if (data.data) {
          setPoll((prev) =>
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
      } else {
        setVoteError(
          data.error ||
            (language === "bn" ? "ভোট দিতে ব্যর্থ হয়েছে" : "Failed to submit vote")
        );
        if (data.already_voted) {
          setPoll((prev) =>
            prev
              ? { ...prev, has_voted: true, voted_option_id: data.voted_option_id }
              : null
          );
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      setVoteError(
        language === "bn" ? "ভোট দিতে ব্যর্থ হয়েছে" : "Failed to submit vote"
      );
    } finally {
      setVoting(false);
    }
  };

  const handlePhoneVerified = async (phoneHash: string) => {
    localStorage.setItem(VOTER_HASH_KEY, phoneHash);
    setVoterHash(phoneHash);
    setShowPhoneVerification(false);
    setTimeout(() => submitVote(), 100);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {language === "bn" ? "চলমান" : "Open"}
          </span>
        );
      case "scheduled":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {language === "bn" ? "আসন্ন" : "Upcoming"}
          </span>
        );
      case "closed":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {language === "bn" ? "সমাপ্ত" : "Closed"}
          </span>
        );
      default:
        return null;
    }
  };

  const canShowResults = (poll: Poll) => {
    return (
      poll.computed_status === "closed" ||
      poll.has_voted ||
      poll.show_results_before_end
    );
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://smjahangir.com/polls/${pollId}`;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          {language === "bn" ? "পোল পাওয়া যায়নি" : "Poll Not Found"}
        </h1>
        <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {language === "bn" ? "এই পোলটি বিদ্যমান নেই বা মুছে ফেলা হয়েছে" : "This poll doesn't exist or has been removed"}
        </p>
        <Link
          href="/polls"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {language === "bn" ? "সকল পোল দেখুন" : "View All Polls"}
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Hero Section */}
      <div
        className={`relative py-12 ${
          isDark
            ? "bg-gradient-to-r from-green-900 via-green-800 to-green-900"
            : "bg-gradient-to-r from-green-600 via-green-500 to-green-600"
        }`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {language === "bn" ? "হোম" : "Home"}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/polls" className="hover:text-white transition-colors">
                  {language === "bn" ? "পোলস" : "Polls"}
                </Link>
              </li>
              <li>/</li>
              <li className="text-white">{getText(poll.title_en, poll.title_bn).substring(0, 30)}...</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {getStatusBadge(poll.computed_status)}
            {poll.has_voted && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 text-white flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {language === "bn" ? "ভোট দেওয়া হয়েছে" : "Voted"}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {getText(poll.title_en, poll.title_bn)}
          </h1>

          {(poll.description_en || poll.description_bn) && (
            <p className="text-white/80 mb-4 max-w-2xl">
              {getText(poll.description_en || "", poll.description_bn)}
            </p>
          )}

          {/* Share Section */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-white/70 text-sm mb-3">
              {language === "bn" ? "এই পোল শেয়ার করুন:" : "Share this poll:"}
            </p>
            <SocialShare
              url={shareUrl}
              title={getText(poll.title_en, poll.title_bn)}
              description={getText(poll.description_en || "", poll.description_bn)}
              hashtags={["SMJahangir", "Dhaka18", "Poll", "Vote"]}
              variant="icons"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Poll Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-2xl shadow-lg overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}>
          {/* Poll Info */}
          <div className={`p-6 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className={isDark ? "text-gray-400" : "text-gray-500"}>
                <span className="font-medium">{language === "bn" ? "শুরু:" : "Start:"}</span>{" "}
                {formatDateTime(poll.start_datetime)}
              </div>
              <div className={isDark ? "text-gray-400" : "text-gray-500"}>
                <span className="font-medium">{language === "bn" ? "শেষ:" : "End:"}</span>{" "}
                {formatDateTime(poll.end_datetime)}
              </div>
              {canShowResults(poll) && (
                <div className={`${isDark ? "text-green-400" : "text-green-600"} font-semibold`}>
                  {language === "bn" ? "মোট ভোট:" : "Total Votes:"}{" "}
                  {poll.total_votes.toLocaleString(language === "bn" ? "bn-BD" : "en-US")}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="p-6">
            {/* Error message */}
            {voteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                {voteError}
              </div>
            )}

            {/* Success message */}
            {voteSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {language === "bn"
                  ? "আপনার ভোট সফলভাবে গ্রহণ করা হয়েছে!"
                  : "Your vote has been recorded successfully!"}
              </div>
            )}

            <div className="space-y-3">
              {poll.poll_options?.map((option) => {
                const isSelected = selectedOption === option.id;
                const isVoted = poll.voted_option_id === option.id;
                const showResults = canShowResults(poll);
                const percentage = option.percentage || 0;

                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      if (poll.computed_status === "active" && !poll.has_voted) {
                        setSelectedOption(option.id);
                      }
                    }}
                    className={`
                      relative overflow-hidden rounded-xl transition-all
                      ${poll.computed_status === "active" && !poll.has_voted ? "cursor-pointer" : "cursor-default"}
                      ${isSelected ? "ring-2 ring-green-500" : isVoted ? "ring-2 ring-green-500" : ""}
                      ${isDark ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-100 hover:bg-gray-150"}
                    `}
                  >
                    {showResults && (
                      <div
                        className={`absolute inset-0 transition-all duration-500 ${
                          isVoted ? "bg-green-500/20" : isDark ? "bg-gray-600" : "bg-gray-200"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="relative p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${isSelected || isVoted ? "border-green-500 bg-green-500" : isDark ? "border-gray-500" : "border-gray-400"}
                          `}
                        >
                          {(isSelected || isVoted) && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {getText(option.option_en, option.option_bn)}
                        </span>
                      </div>

                      {showResults && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {percentage}%
                          </div>
                          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {(option.vote_count || 0).toLocaleString(language === "bn" ? "bn-BD" : "en-US")}{" "}
                            {language === "bn" ? "ভোট" : "votes"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote button */}
            {poll.computed_status === "active" && !poll.has_voted && !voteSuccess && (
              <button
                onClick={handleVote}
                disabled={!selectedOption || voting}
                className={`
                  w-full mt-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                  ${!selectedOption || voting ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}
                `}
              >
                {voting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {language === "bn" ? "জমা হচ্ছে..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {language === "bn" ? "ভোট দিন" : "Submit Vote"}
                  </>
                )}
              </button>
            )}

            {/* Verification notice */}
            {poll.require_verification && !voterHash && (
              <p className={`mt-4 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {language === "bn" ? "ভোট দিতে ফোন যাচাইকরণ প্রয়োজন" : "Phone verification required to vote"}
              </p>
            )}

            {/* Status messages */}
            {poll.computed_status === "scheduled" && (
              <div className={`mt-6 p-4 rounded-xl text-center ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                <p className={`font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {language === "bn" ? "এই পোল এখনো শুরু হয়নি" : "This poll has not started yet"}
                </p>
                <p className={`text-sm mt-1 ${isDark ? "text-blue-400/70" : "text-blue-500"}`}>
                  {language === "bn" ? "শুরু হবে: " : "Starts on: "}
                  {formatDateTime(poll.start_datetime)}
                </p>
              </div>
            )}

            {poll.computed_status === "closed" && (
              <div className={`mt-6 p-4 rounded-xl text-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {language === "bn" ? "এই পোলটি সমাপ্ত হয়েছে" : "This poll has ended"}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Share Section */}
          <div className={`p-6 border-t ${isDark ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {language === "bn" ? "এই পোল আপনার বন্ধুদের সাথে শেয়ার করুন" : "Share this poll with your friends"}
              </p>
              <SocialShare
                url={shareUrl}
                title={getText(poll.title_en, poll.title_bn)}
                description={getText(poll.description_en || "", poll.description_bn)}
                hashtags={["SMJahangir", "Dhaka18", "Poll"]}
                variant="dropdown"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Back to Polls */}
        <div className="mt-6 text-center">
          <Link
            href="/polls"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === "bn" ? "সকল পোল দেখুন" : "View All Polls"}
          </Link>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerification
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerified={handlePhoneVerified}
        title={{
          en: "Verify to Vote",
          bn: "ভোট দিতে যাচাই করুন",
        }}
        description={{
          en: "Enter your phone number to verify your identity",
          bn: "আপনার পরিচয় যাচাই করতে ফোন নম্বর দিন",
        }}
      />
    </div>
  );
}
