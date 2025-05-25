import { HeroSection } from '@/components/sections/hero-section';
import { ComebackGenerator } from '@/components/sections/comeback-generator';
import { Testimonials } from '@/components/sections/testimonials';
import { MemeEditorSection } from '@/components/sections/meme-editor';
import { RankingSection } from '@/components/sections/ranking-section';
import { KnowledgeBase } from '@/components/sections/knowledge-base';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center w-full">
      <div className="w-full max-w-7xl mx-auto">
        <HeroSection />
        <ComebackGenerator />
        <RankingSection />
        <MemeEditorSection />
        <Testimonials />
        <KnowledgeBase />
        <Footer />
      </div>
    </main>
  );
}