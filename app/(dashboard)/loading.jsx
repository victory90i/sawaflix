import DashboardWrapper from "../../components/Dashboard/DashboardWrapper";
import { FeedSkeleton } from "../../components/Dashboard/Skeletons";

export default function Loading() {
  return (
    <DashboardWrapper>
      <FeedSkeleton />
    </DashboardWrapper>
  );
}
