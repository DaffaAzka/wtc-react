import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { SiReact, SiVuedotjs, SiNodedotjs, SiPython, SiDocker, SiMongodb, SiTypescript, SiPostgresql, SiGit, SiGraphql, SiRedis, SiLaravel, SiKotlin, SiFlutter, SiMysql, SiPhp } from "react-icons/si";
import { FaAws, FaJava } from "react-icons/fa";
import { teamPhotos } from "@/components/custom/team-photos";

export function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // Animated counters state
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Back to Top button state
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [teamPhotos.length]);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);

          // Animate students count
          let students = 0;
          const studentsInterval = setInterval(() => {
            students += 100;
            if (students >= 5000) {
              setStudentsCount(5000);
              clearInterval(studentsInterval);
            } else {
              setStudentsCount(students);
            }
          }, 20);

          // Animate courses count
          let courses = 0;
          const coursesInterval = setInterval(() => {
            courses += 1;
            if (courses >= 50) {
              setCoursesCount(50);
              clearInterval(coursesInterval);
            } else {
              setCoursesCount(courses);
            }
          }, 30);

          // Animate success rate
          let success = 0;
          const successInterval = setInterval(() => {
            success += 2;
            if (success >= 95) {
              setSuccessCount(95);
              clearInterval(successInterval);
            } else {
              setSuccessCount(success);
            }
          }, 25);
        }
      },
      { threshold: 0.5 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

  return (
    <div className="dark min-h-screen bg-background overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/20">
        <div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Hide Scrollbar CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Hide scrollbar for Chrome, Safari and Opera */
          ::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          body, html {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
            overflow-x: hidden;
          }
        `,
        }}
      />
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Carousel - Only on right side */}
        <div className="absolute inset-0 lg:left-1/2">
          {teamPhotos.map((photo, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
              style={{
                backgroundImage: `url(${photo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:from-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:items-center lg:px-8">
          <div className={`lg:w-1/2 lg:pr-12 transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            {/* Logo Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 backdrop-blur-sm">
              <div className="relative h-8 w-8 rotate-45 rounded-lg bg-gradient-to-br from-primary to-primary/60">
                <span className="absolute inset-0 flex -rotate-45 items-center justify-center text-sm font-bold text-primary-foreground">W</span>
              </div>
              <span className="text-sm font-medium text-foreground">Webtech Training Camp</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Master Web Technology. <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">Build the Future.</span>
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg text-muted-foreground/90 sm:text-xl">
              Learn modern web development through hands-on projects, expert mentorship, and industry-ready curriculum. Join thousands of developers leveling up their skills.
            </p>

            {/* Stats - Animated Counters */}
            <div ref={statsRef} className="mb-10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-foreground transition-all duration-300">{studentsCount > 0 ? `${(studentsCount / 1000).toFixed(1)}K+` : "5K+"}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground transition-all duration-300">{coursesCount > 0 ? `${coursesCount}+` : "50+"}</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground transition-all duration-300">{successCount > 0 ? `${successCount}%` : "95%"}</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group relative overflow-hidden rounded-xl bg-primary px-8 py-4 text-center font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
              >
                <span className="relative z-10">Start Learning Free</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border-2 border-border px-8 py-4 text-center font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30">
            <div className="mx-auto mt-1 h-2 w-1 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Features Section - Glassmorphic Cards */}
      <section className="relative border-t border-border/50 bg-background/50 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Everything You Need to Excel</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">From beginner to professional, we've got you covered with comprehensive learning paths</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-300 group-hover:bg-primary/20" />
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">Interactive Courses</h3>
                <p className="mb-4 text-muted-foreground">Learn through hands-on coding exercises, real-world projects, and instant feedback from our platform</p>
                <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3">
                  Explore courses
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-300 group-hover:bg-primary/20" />
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">Industry Ready Skills</h3>
                <p className="mb-4 text-muted-foreground">Build portfolio-worthy projects with modern tools and frameworks used by top tech companies</p>
                <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3">
                  View projects
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-300 group-hover:bg-primary/20" />
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">Expert Mentorship</h3>
                <p className="mb-4 text-muted-foreground">Get personalized guidance from experienced developers and industry professionals every step of the way</p>
                <Link to="/mentors" className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3">
                  Meet mentors
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Feature Card 4 - Community & Support */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:bg-card/50 hover:shadow-xl hover:shadow-primary/10">
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                <svg className="size-8 text-primary transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-bold text-foreground">Community & Support</h3>
              <p className="mb-6 text-muted-foreground">Join thousands of learners, get help from mentors, and collaborate with peers in our vibrant community.</p>

              {/* Link */}
              <Link to="/help" className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300 hover:gap-3 hover:text-primary/80">
                Join Community
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="border-t border-border/50 bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Master Modern Technologies</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Learn the most in-demand tools and frameworks used by top companies</p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {/* React */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiReact className="mb-3 h-12 w-12 text-[#61DAFB] transition-transform group-hover:rotate-12" />
              <div className="text-sm font-medium text-foreground">React</div>
            </div>

            {/* Vue */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiVuedotjs className="mb-3 h-12 w-12 text-[#4FC08D] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">Vue.js</div>
            </div>

            {/* Node.js */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiNodedotjs className="mb-3 h-12 w-12 text-[#339933] transition-transform group-hover:rotate-180" />
              <div className="text-sm font-medium text-foreground">Node.js</div>
            </div>

            {/* Python */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiPython className="mb-3 h-12 w-12 text-[#3776AB] transition-transform group-hover:-rotate-12" />
              <div className="text-sm font-medium text-foreground">Python</div>
            </div>

            {/* Docker */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiDocker className="mb-3 h-12 w-12 text-[#2496ED] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">Docker</div>
            </div>

            {/* MongoDB */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiMongodb className="mb-3 h-12 w-12 text-[#47A248] transition-transform group-hover:rotate-12" />
              <div className="text-sm font-medium text-foreground">MongoDB</div>
            </div>

            {/* TypeScript */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiTypescript className="mb-3 h-12 w-12 text-[#3178C6] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">TypeScript</div>
            </div>

            {/* PostgreSQL */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiPostgresql className="mb-3 h-12 w-12 text-[#4169E1] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">PostgreSQL</div>
            </div>

            {/* AWS */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <FaAws className="mb-3 h-12 w-12 text-[#FF9900] transition-transform group-hover:-translate-y-1" />
              <div className="text-sm font-medium text-foreground">AWS</div>
            </div>

            {/* Git */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiGit className="mb-3 h-12 w-12 text-[#F05032] transition-transform group-hover:rotate-12" />
              <div className="text-sm font-medium text-foreground">Git</div>
            </div>

            {/* GraphQL */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiGraphql className="mb-3 h-12 w-12 text-[#E10098] transition-transform group-hover:rotate-90" />
              <div className="text-sm font-medium text-foreground">GraphQL</div>
            </div>

            {/* Redis */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiRedis className="mb-3 h-12 w-12 text-[#DC382D] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">Redis</div>
            </div>

            {/* Laravel */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiLaravel className="mb-3 h-12 w-12 text-[#FF2D20] transition-transform group-hover:rotate-12" />
              <div className="text-sm font-medium text-foreground">Laravel</div>
            </div>

            {/* Kotlin */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiKotlin className="mb-3 h-12 w-12 text-[#7F52FF] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">Kotlin</div>
            </div>

            {/* Flutter */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiFlutter className="mb-3 h-12 w-12 text-[#02569B] transition-transform group-hover:-translate-y-1" />
              <div className="text-sm font-medium text-foreground">Flutter</div>
            </div>

            {/* Java */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <FaJava className="mb-3 h-12 w-12 text-[#007396] transition-transform group-hover:rotate-12" />
              <div className="text-sm font-medium text-foreground">Java</div>
            </div>

            {/* MySQL */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiMysql className="mb-3 h-12 w-12 text-[#4479A1] transition-transform group-hover:scale-110" />
              <div className="text-sm font-medium text-foreground">MySQL</div>
            </div>

            {/* PHP */}
            <div className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg">
              <SiPhp className="mb-3 h-12 w-12 text-[#777BB4] transition-transform group-hover:rotate-12" />
              <div className="text-sm font-medium text-foreground">PHP</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border/50 bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Your journey from beginner to professional in four simple steps</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="group relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  01
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Browse Courses</h3>
              <p className="text-muted-foreground">Explore our comprehensive library of courses and choose your learning path</p>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  02
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Learn Interactively</h3>
              <p className="text-muted-foreground">Follow along with video lessons, coding exercises, and quizzes</p>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  03
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Build Projects</h3>
              <p className="text-muted-foreground">Apply your skills by building real-world projects for your portfolio</p>
            </div>

            {/* Step 4 */}
            <div className="group relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  04
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Get Certified</h3>
              <p className="text-muted-foreground">Earn certificates and showcase your achievements to employers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t border-border/50 bg-background/50 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Success Stories</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Hear from our students who transformed their careers</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                <div>
                  <div className="font-semibold text-foreground">Ahmad Rizki</div>
                  <div className="text-sm text-muted-foreground">Frontend Developer</div>
                </div>
              </div>
              <p className="mb-4 text-muted-foreground">"WTC helped me land my dream job as a frontend developer. The hands-on projects and mentorship were invaluable."</p>
              <div className="flex gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                <div>
                  <div className="font-semibold text-foreground">Siti Nurhaliza</div>
                  <div className="text-sm text-muted-foreground">Full Stack Developer</div>
                </div>
              </div>
              <p className="mb-4 text-muted-foreground">"The curriculum is well-structured and up-to-date with industry standards. I gained practical skills that I use every day."</p>
              <div className="flex gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                <div>
                  <div className="font-semibold text-foreground">Budi Santoso</div>
                  <div className="text-sm text-muted-foreground">UI/UX Developer</div>
                </div>
              </div>
              <p className="mb-4 text-muted-foreground">"Best investment I made in my career. The community support and expert mentors made all the difference."</p>
              <div className="flex gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border/50 bg-background py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about WTC</p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
              <button onClick={() => setActiveAccordion(activeAccordion === 0 ? null : 0)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-semibold text-foreground">Is WTC really free?</h3>
                <svg className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${activeAccordion === 0 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 0 ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-6 text-muted-foreground">
                  Yes! We offer free access to core courses and materials. Premium features and certifications are available for those who want to take their learning further.
                </p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
              <button onClick={() => setActiveAccordion(activeAccordion === 1 ? null : 1)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-semibold text-foreground">What courses are available?</h3>
                <svg className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${activeAccordion === 1 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 1 ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-6 text-muted-foreground">
                  We offer courses in frontend development (React, Vue, Angular), backend (Node.js, Python, Go), mobile development, DevOps, and more. New courses are added regularly.
                </p>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
              <button onClick={() => setActiveAccordion(activeAccordion === 2 ? null : 2)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-semibold text-foreground">Can I learn at my own pace?</h3>
                <svg className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${activeAccordion === 2 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 2 ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-6 text-muted-foreground">Absolutely! All courses are self-paced. Learn when it fits your schedule, with lifetime access to course materials.</p>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
              <button onClick={() => setActiveAccordion(activeAccordion === 3 ? null : 3)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-semibold text-foreground">Do I get a certificate?</h3>
                <svg className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${activeAccordion === 3 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 3 ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-6 text-muted-foreground">Yes! Upon completing a course, you'll receive a certificate that you can share on LinkedIn and with potential employers.</p>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
              <button onClick={() => setActiveAccordion(activeAccordion === 4 ? null : 4)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-semibold text-foreground">What if I need help?</h3>
                <svg className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${activeAccordion === 4 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 4 ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-6 text-muted-foreground">
                  Our community and mentors are here to help! Join our Discord server, participate in live Q&A sessions, and get personalized guidance from expert developers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border/50 bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">Ready to Start Your Journey?</h2>
          <p className="mb-10 text-xl text-muted-foreground">Join thousands of developers who are already building their future with us</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-5 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
          >
            Get Started Free
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 inline-flex items-center gap-2">
                <div className="relative h-8 w-8 rotate-45 rounded-lg bg-gradient-to-br from-primary to-primary/60">
                  <span className="absolute inset-0 flex -rotate-45 items-center justify-center text-sm font-bold text-primary-foreground">W</span>
                </div>
                <span className="text-lg font-bold text-foreground">Webtech Training Camp</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Master web technology through hands-on learning and expert guidance</p>

              {/* Social Media Icons */}
              <div className="mb-4 flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
                  aria-label="Discord"
                >
                  <svg className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                  </svg>
                </a>
              </div>

              <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Webtech Training Camp. All rights reserved.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Learn</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/courses" className="hover:text-primary">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/tracks" className="hover:text-primary">
                    Learning Tracks
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-primary">
                    Projects
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
