import { StatsBar } from "@/components/StatsBar";
import { LevelPath } from "@/components/LevelPath";
import { TaskList } from "@/components/TaskList";
import { FocusTimer } from "@/components/FocusTimer";
import { LevelUpModal } from "@/components/LevelUpModal";
import { DailyMotivation } from "@/components/DailyMotivation";
import { MilestoneModal } from "@/components/MilestoneModal";
import { RotatingQuotes } from "@/components/RotatingQuotes";
import { StreakRewardModal } from "@/components/StreakRewardModal";

export default function Home() {
  return (
    <div className="min-h-screen w-full px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <StatsBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <LevelPath />
            {/* Mobile: show Sprint above the checklist for better flow */}
            <div className="lg:hidden">
              <FocusTimer />
            </div>
            <TaskList />
          </div>
          <div className="space-y-6">
            {/* Desktop: keep Sprint in the sidebar */}
            <div className="hidden lg:block">
              <FocusTimer />
            </div>
            <div className="card p-4">
              <div className="font-semibold mb-2">How it works</div>
              <div className="text-sm text-white/70">
                Complete tasks to earn XP and fill the path to the next level. Gifts and fun messages unlock with each level-up. Use Focus Mode sprints to channel urgency if you procrastinate actively.
              </div>
            </div>
            <div className="hidden lg:block">
              <RotatingQuotes />
            </div>
          </div>
        </div>
        {/* Mobile: quotes under Sprint */}
        <div className="lg:hidden space-y-6">
          <RotatingQuotes />
        </div>
      </div>
      <LevelUpModal />
      <MilestoneModal />
      <StreakRewardModal />
      <DailyMotivation />
    </div>
  );
}
