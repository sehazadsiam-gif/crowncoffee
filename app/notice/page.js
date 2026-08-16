import { getSettings, getNotices } from "@/lib/data";
import NoticeClient from "@/components/notice/NoticeClient";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: `Notices & Announcements — ${settings.siteName}`,
    description: `Official customer desk, operating hours updates, events, and announcements for ${settings.siteName} Bangladesh.`,
  };
}

export default async function NoticePage() {
  const { notices } = await getNotices();

  return <NoticeClient initialNotices={notices} />;
}
