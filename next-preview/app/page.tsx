import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import About from '@/components/About';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import VideoShowcase from '@/components/VideoShowcase';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Gallery />
      <VideoShowcase />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
