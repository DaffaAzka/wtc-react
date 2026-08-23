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
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">
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
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60 lg:from-background lg:via-background/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:items-center lg:px-8">
          <div className={`lg:w-1/2 lg:pr-16 transition-all duration-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            {/* Logo Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 shadow-sm">
              <img
                src="/brand-pack/icon-1.svg"
                alt="Webtech Logo"
                className="h-6 w-6"
              />
              <span className="text-sm font-semibold text-foreground">Webtech Training Camp</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Master Web Technology.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Build the Future.
              </span>
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Learn modern web development through hands-on projects, expert mentorship, and industry-ready curriculum.
            </p>

            {/* Stats */}
            <div ref={statsRef} className="mb-10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {studentsCount > 0 ? `${(studentsCount / 1000).toFixed(1)}K+` : "5K+"}
                </div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {coursesCount > 0 ? `${coursesCount}+` : "50+"}
                </div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {successCount > 0 ? `${successCount}%` : "95%"}
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-center font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
              >
                <span>Start Learning Free</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 py-4 text-center font-semibold text-foreground transition-all hover:bg-accent"
              >
                <span>Sign In</span>
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

      {/* Features Section */}
      <section className="border-t border-border bg-slate-50 dark:bg-slate-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Everything You Need to Excel</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Comprehensive learning paths from beginner to professional</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {/* Feature 1 */}
            <div className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Interactive Courses</h3>
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">Learn through hands-on coding exercises and real-world projects</p>
              <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                Explore courses
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10">
                <svg className="h-7 w-7 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Industry Ready Skills</h3>
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">Build portfolio projects with modern tools used by top companies</p>
              <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                View projects
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10">
                <svg className="h-7 w-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Expert Mentorship</h3>
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">Get personalized guidance from experienced developers</p>
              <Link to="/mentors" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Meet mentors
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10">
                <svg className="h-7 w-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Community & Support</h3>
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">Join thousands of learners in our vibrant community</p>
              <Link to="/help" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
                Join Community
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="relative border-t border-border/50 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.03),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/30 px-4 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Technologies
            </div>
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Master Modern Technologies
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Learn the most in-demand tools and frameworks used by top companies worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {/* React */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#61DAFB]/5 hover:-translate-y-1 hover:border-[#61DAFB]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#61DAFB]/0 to-[#61DAFB]/0 opacity-0 transition-opacity group-hover:from-[#61DAFB]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiReact className="relative mb-3 h-12 w-12 text-[#61DAFB]" />
              <div className="relative text-sm font-medium text-foreground">React</div>
            </div>

            {/* Vue */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#4FC08D]/5 hover:-translate-y-1 hover:border-[#4FC08D]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4FC08D]/0 to-[#4FC08D]/0 opacity-0 transition-opacity group-hover:from-[#4FC08D]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiVuedotjs className="relative mb-3 h-12 w-12 text-[#4FC08D]" />
              <div className="relative text-sm font-medium text-foreground">Vue.js</div>
            </div>

            {/* Node.js */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#339933]/5 hover:-translate-y-1 hover:border-[#339933]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#339933]/0 to-[#339933]/0 opacity-0 transition-opacity group-hover:from-[#339933]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiNodedotjs className="relative mb-3 h-12 w-12 text-[#339933]" />
              <div className="relative text-sm font-medium text-foreground">Node.js</div>
            </div>

            {/* Python */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#3776AB]/5 hover:-translate-y-1 hover:border-[#3776AB]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#3776AB]/0 to-[#3776AB]/0 opacity-0 transition-opacity group-hover:from-[#3776AB]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiPython className="relative mb-3 h-12 w-12 text-[#3776AB]" />
              <div className="relative text-sm font-medium text-foreground">Python</div>
            </div>

            {/* Docker */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#2496ED]/5 hover:-translate-y-1 hover:border-[#2496ED]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#2496ED]/0 to-[#2496ED]/0 opacity-0 transition-opacity group-hover:from-[#2496ED]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiDocker className="relative mb-3 h-12 w-12 text-[#2496ED]" />
              <div className="relative text-sm font-medium text-foreground">Docker</div>
            </div>

            {/* MongoDB */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#47A248]/5 hover:-translate-y-1 hover:border-[#47A248]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#47A248]/0 to-[#47A248]/0 opacity-0 transition-opacity group-hover:from-[#47A248]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiMongodb className="relative mb-3 h-12 w-12 text-[#47A248]" />
              <div className="relative text-sm font-medium text-foreground">MongoDB</div>
            </div>

            {/* TypeScript */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#3178C6]/5 hover:-translate-y-1 hover:border-[#3178C6]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#3178C6]/0 to-[#3178C6]/0 opacity-0 transition-opacity group-hover:from-[#3178C6]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiTypescript className="relative mb-3 h-12 w-12 text-[#3178C6]" />
              <div className="relative text-sm font-medium text-foreground">TypeScript</div>
            </div>

            {/* PostgreSQL */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#4169E1]/5 hover:-translate-y-1 hover:border-[#4169E1]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4169E1]/0 to-[#4169E1]/0 opacity-0 transition-opacity group-hover:from-[#4169E1]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiPostgresql className="relative mb-3 h-12 w-12 text-[#4169E1]" />
              <div className="relative text-sm font-medium text-foreground">PostgreSQL</div>
            </div>

            {/* AWS */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#FF9900]/5 hover:-translate-y-1 hover:border-[#FF9900]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF9900]/0 to-[#FF9900]/0 opacity-0 transition-opacity group-hover:from-[#FF9900]/5 group-hover:to-transparent group-hover:opacity-100" />
              <FaAws className="relative mb-3 h-12 w-12 text-[#FF9900]" />
              <div className="relative text-sm font-medium text-foreground">AWS</div>
            </div>

            {/* Git */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#F05032]/5 hover:-translate-y-1 hover:border-[#F05032]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#F05032]/0 to-[#F05032]/0 opacity-0 transition-opacity group-hover:from-[#F05032]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiGit className="relative mb-3 h-12 w-12 text-[#F05032]" />
              <div className="relative text-sm font-medium text-foreground">Git</div>
            </div>

            {/* GraphQL */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#E10098]/5 hover:-translate-y-1 hover:border-[#E10098]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E10098]/0 to-[#E10098]/0 opacity-0 transition-opacity group-hover:from-[#E10098]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiGraphql className="relative mb-3 h-12 w-12 text-[#E10098]" />
              <div className="relative text-sm font-medium text-foreground">GraphQL</div>
            </div>

            {/* Redis */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#DC382D]/5 hover:-translate-y-1 hover:border-[#DC382D]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#DC382D]/0 to-[#DC382D]/0 opacity-0 transition-opacity group-hover:from-[#DC382D]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiRedis className="relative mb-3 h-12 w-12 text-[#DC382D]" />
              <div className="relative text-sm font-medium text-foreground">Redis</div>
            </div>

            {/* Laravel */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#FF2D20]/5 hover:-translate-y-1 hover:border-[#FF2D20]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF2D20]/0 to-[#FF2D20]/0 opacity-0 transition-opacity group-hover:from-[#FF2D20]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiLaravel className="relative mb-3 h-12 w-12 text-[#FF2D20]" />
              <div className="relative text-sm font-medium text-foreground">Laravel</div>
            </div>

            {/* Kotlin */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#7F52FF]/5 hover:-translate-y-1 hover:border-[#7F52FF]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7F52FF]/0 to-[#7F52FF]/0 opacity-0 transition-opacity group-hover:from-[#7F52FF]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiKotlin className="relative mb-3 h-12 w-12 text-[#7F52FF]" />
              <div className="relative text-sm font-medium text-foreground">Kotlin</div>
            </div>

            {/* Flutter */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#02569B]/5 hover:-translate-y-1 hover:border-[#02569B]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#02569B]/0 to-[#02569B]/0 opacity-0 transition-opacity group-hover:from-[#02569B]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiFlutter className="relative mb-3 h-12 w-12 text-[#02569B]" />
              <div className="relative text-sm font-medium text-foreground">Flutter</div>
            </div>

            {/* Java */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#007396]/5 hover:-translate-y-1 hover:border-[#007396]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#007396]/0 to-[#007396]/0 opacity-0 transition-opacity group-hover:from-[#007396]/5 group-hover:to-transparent group-hover:opacity-100" />
              <FaJava className="relative mb-3 h-12 w-12 text-[#007396]" />
              <div className="relative text-sm font-medium text-foreground">Java</div>
            </div>

            {/* MySQL */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#4479A1]/5 hover:-translate-y-1 hover:border-[#4479A1]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4479A1]/0 to-[#4479A1]/0 opacity-0 transition-opacity group-hover:from-[#4479A1]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiMysql className="relative mb-3 h-12 w-12 text-[#4479A1]" />
              <div className="relative text-sm font-medium text-foreground">MySQL</div>
            </div>

            {/* PHP */}
            <div className="group relative flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#777BB4]/5 hover:-translate-y-1 hover:border-[#777BB4]/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#777BB4]/0 to-[#777BB4]/0 opacity-0 transition-opacity group-hover:from-[#777BB4]/5 group-hover:to-transparent group-hover:opacity-100" />
              <SiPhp className="relative mb-3 h-12 w-12 text-[#777BB4]" />
              <div className="relative text-sm font-medium text-foreground">PHP</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative border-t border-border/50 bg-white dark:bg-slate-900 py-32">
        {/* Decorative gradient orbs */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/5 to-cyan-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simple Process
            </div>
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Your journey from beginner to professional in four simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="group relative">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 lg:block" />

              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-all group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110">
                    <span className="text-2xl font-bold text-white">01</span>
                    <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 blur transition-opacity group-hover:opacity-30" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Browse Courses</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Explore our comprehensive library of courses and choose your learning path based on your goals
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-cyan-200 to-indigo-200 dark:from-cyan-800 dark:to-indigo-800 lg:block" />

              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all group-hover:shadow-xl group-hover:shadow-cyan-500/40 group-hover:scale-110">
                    <span className="text-2xl font-bold text-white">02</span>
                    <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 opacity-0 blur transition-opacity group-hover:opacity-30" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Learn Interactively</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Follow along with video lessons, hands-on coding exercises, and interactive quizzes
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-indigo-200 to-violet-200 dark:from-indigo-800 dark:to-violet-800 lg:block" />

              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 transition-all group-hover:shadow-xl group-hover:shadow-indigo-500/40 group-hover:scale-110">
                    <span className="text-2xl font-bold text-white">03</span>
                    <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 opacity-0 blur transition-opacity group-hover:opacity-30" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Build Projects</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Apply your skills by building real-world projects that look great in your portfolio
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="group relative">
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/25 transition-all group-hover:shadow-xl group-hover:shadow-violet-500/40 group-hover:scale-110">
                    <span className="text-2xl font-bold text-white">04</span>
                    <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 opacity-0 blur transition-opacity group-hover:opacity-30" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Get Certified</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Earn certificates and showcase your achievements to potential employers
                </p>
              </div>
            </div>
          </div>

          {/* CTA below steps */}
          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 px-8 py-4 font-semibold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <span>Start Your Journey Today</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative border-t border-border/50 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/60 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/30 px-4 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Success Stories
            </div>
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Hear From Our Students
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Join thousands of developers who transformed their careers with us
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-20" />
              <div className="relative h-full rounded-2xl border border-border/50 bg-card p-8 shadow-lg shadow-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                {/* Quote icon */}
                <div className="mb-6">
                  <svg className="h-10 w-10 text-blue-500/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <p className="mb-6 text-base leading-relaxed text-foreground">
                  "WTC helped me land my dream job as a frontend developer. The hands-on projects and mentorship were invaluable."
                </p>

                <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 ring-4 ring-blue-500/10" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Ahmad Rizki</div>
                    <div className="text-sm text-muted-foreground">Frontend Developer</div>
                  </div>
                </div>

                {/* Star rating */}
                <div className="mt-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-20" />
              <div className="relative h-full rounded-2xl border border-border/50 bg-card p-8 shadow-lg shadow-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-cyan-500/10 group-hover:border-cyan-200 dark:group-hover:border-cyan-800">
                {/* Quote icon */}
                <div className="mb-6">
                  <svg className="h-10 w-10 text-cyan-500/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <p className="mb-6 text-base leading-relaxed text-foreground">
                  "The curriculum is well-structured and up-to-date with industry standards. I gained practical skills that I use every day."
                </p>

                <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 ring-4 ring-cyan-500/10" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Siti Nurhaliza</div>
                    <div className="text-sm text-muted-foreground">Full Stack Developer</div>
                  </div>
                </div>

                {/* Star rating */}
                <div className="mt-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-20" />
              <div className="relative h-full rounded-2xl border border-border/50 bg-card p-8 shadow-lg shadow-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-500/10 group-hover:border-indigo-200 dark:group-hover:border-indigo-800">
                {/* Quote icon */}
                <div className="mb-6">
                  <svg className="h-10 w-10 text-indigo-500/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <p className="mb-6 text-base leading-relaxed text-foreground">
                  "Best investment I made in my career. The community support and expert mentors made all the difference."
                </p>

                <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-4 ring-indigo-500/10" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Budi Santoso</div>
                    <div className="text-sm text-muted-foreground">UI/UX Developer</div>
                  </div>
                </div>

                {/* Star rating */}
                <div className="mt-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative border-t border-border/50 bg-slate-50 dark:bg-slate-900 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.03),transparent_50%),radial-gradient(circle_at_30%_70%,rgba(139,92,246,0.03),transparent_50%)]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200/60 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FAQ
            </div>
            <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Everything you need to know about getting started
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="group rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800">
              <button onClick={() => setActiveAccordion(activeAccordion === 0 ? null : 0)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-bold text-foreground pr-8">Is WTC really free?</h3>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 transition-all ${activeAccordion === 0 ? "bg-blue-500 rotate-180" : "group-hover:bg-blue-500/20"}`}>
                  <svg className={`h-5 w-5 transition-colors ${activeAccordion === 0 ? "text-white" : "text-blue-600 dark:text-blue-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 0 ? "max-h-48 border-t border-border/30" : "max-h-0"}`}>
                <p className="px-6 py-6 text-base leading-relaxed text-muted-foreground">
                  Yes! We offer free access to core courses and materials. Premium features and certifications are available for those who want to take their learning further.
                </p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="group rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg hover:border-cyan-200 dark:hover:border-cyan-800">
              <button onClick={() => setActiveAccordion(activeAccordion === 1 ? null : 1)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-bold text-foreground pr-8">What courses are available?</h3>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 transition-all ${activeAccordion === 1 ? "bg-cyan-500 rotate-180" : "group-hover:bg-cyan-500/20"}`}>
                  <svg className={`h-5 w-5 transition-colors ${activeAccordion === 1 ? "text-white" : "text-cyan-600 dark:text-cyan-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 1 ? "max-h-48 border-t border-border/30" : "max-h-0"}`}>
                <p className="px-6 py-6 text-base leading-relaxed text-muted-foreground">
                  We offer courses in frontend development (React, Vue, Angular), backend (Node.js, Python, Go), mobile development, DevOps, and more. New courses are added regularly.
                </p>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="group rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800">
              <button onClick={() => setActiveAccordion(activeAccordion === 2 ? null : 2)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-bold text-foreground pr-8">Can I learn at my own pace?</h3>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 transition-all ${activeAccordion === 2 ? "bg-indigo-500 rotate-180" : "group-hover:bg-indigo-500/20"}`}>
                  <svg className={`h-5 w-5 transition-colors ${activeAccordion === 2 ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 2 ? "max-h-48 border-t border-border/30" : "max-h-0"}`}>
                <p className="px-6 py-6 text-base leading-relaxed text-muted-foreground">Absolutely! All courses are self-paced. Learn when it fits your schedule, with lifetime access to course materials.</p>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="group rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800">
              <button onClick={() => setActiveAccordion(activeAccordion === 3 ? null : 3)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-bold text-foreground pr-8">Do I get a certificate?</h3>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10 transition-all ${activeAccordion === 3 ? "bg-violet-500 rotate-180" : "group-hover:bg-violet-500/20"}`}>
                  <svg className={`h-5 w-5 transition-colors ${activeAccordion === 3 ? "text-white" : "text-violet-600 dark:text-violet-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 3 ? "max-h-48 border-t border-border/30" : "max-h-0"}`}>
                <p className="px-6 py-6 text-base leading-relaxed text-muted-foreground">Yes! Upon completing a course, you'll receive a certificate that you can share on LinkedIn and with potential employers.</p>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="group rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-800">
              <button onClick={() => setActiveAccordion(activeAccordion === 4 ? null : 4)} className="flex w-full items-center justify-between p-6 text-left">
                <h3 className="text-lg font-bold text-foreground pr-8">What if I need help?</h3>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-500/10 transition-all ${activeAccordion === 4 ? "bg-pink-500 rotate-180" : "group-hover:bg-pink-500/20"}`}>
                  <svg className={`h-5 w-5 transition-colors ${activeAccordion === 4 ? "text-white" : "text-pink-600 dark:text-pink-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 4 ? "max-h-48 border-t border-border/30" : "max-h-0"}`}>
                <p className="px-6 py-6 text-base leading-relaxed text-muted-foreground">
                  Our community and mentors are here to help! Join our Discord server, participate in live Q&A sessions, and get personalized guidance from expert developers.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 transition-all hover:gap-3"
            >
              Get in touch with us
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border/50 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-white shadow-lg">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Start Your Journey
          </div>

          {/* Heading */}
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Ready to Transform Your Career?
          </h2>

          {/* Description */}
          <p className="mb-12 text-xl leading-relaxed text-white/90 sm:text-2xl">
            Join thousands of developers who are already building their future with us. Start learning today, completely free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-10 py-5 text-lg font-bold text-blue-600 shadow-2xl transition-all hover:scale-105 hover:shadow-white/25"
            >
              <span className="relative z-10">Get Started Free</span>
              <svg className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <Link
              to="/courses"
              className="group inline-flex items-center justify-center gap-3 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-sm px-10 py-5 text-lg font-bold text-white transition-all hover:border-white hover:bg-white/20"
            >
              <span>Browse Courses</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Start immediately</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-slate-900 dark:bg-slate-950 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.03),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.03),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Logo and Description */}
            <div className="lg:col-span-5">
              <div className="mb-6">
                <img
                  src="/brand-pack/logo-h-dark.svg"
                  alt="Webtech Training Camp"
                  className="h-10 w-auto dark:hidden"
                />
                <img
                  src="/brand-pack/logo-h-dark.svg"
                  alt="Webtech Training Camp"
                  className="hidden h-10 w-auto dark:block"
                />
              </div>
              <p className="mb-6 text-base leading-relaxed text-slate-400">
                Master web technology through hands-on learning and expert guidance. Join thousands of developers building their future.
              </p>

              {/* Social Media Icons */}
              <div className="mb-6 flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 transition-all hover:border-blue-500 hover:bg-blue-500/10"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5 text-slate-400 transition-colors group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 transition-all hover:border-cyan-500 hover:bg-cyan-500/10"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5 text-slate-400 transition-colors group-hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 transition-all hover:border-indigo-500 hover:bg-indigo-500/10"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5 text-slate-400 transition-colors group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 transition-all hover:border-violet-500 hover:bg-violet-500/10"
                  aria-label="Discord"
                >
                  <svg className="h-5 w-5 text-slate-400 transition-colors group-hover:text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                  </svg>
                </a>
              </div>

              <p className="text-xs text-slate-500">© {new Date().getFullYear()} Webtech Training Camp. All rights reserved.</p>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              {/* Learn */}
              <div>
                <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">Learn</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link to="/courses" className="text-slate-400 transition-colors hover:text-blue-400">
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/tracks" className="text-slate-400 transition-colors hover:text-blue-400">
                      Learning Tracks
                    </Link>
                  </li>
                  <li>
                    <Link to="/projects" className="text-slate-400 transition-colors hover:text-blue-400">
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link to="/certifications" className="text-slate-400 transition-colors hover:text-blue-400">
                      Certifications
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">Company</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link to="/about" className="text-slate-400 transition-colors hover:text-blue-400">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-slate-400 transition-colors hover:text-blue-400">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-slate-400 transition-colors hover:text-blue-400">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-slate-400 transition-colors hover:text-blue-400">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">Support</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link to="/help" className="text-slate-400 transition-colors hover:text-blue-400">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link to="/community" className="text-slate-400 transition-colors hover:text-blue-400">
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-slate-400 transition-colors hover:text-blue-400">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-slate-400 transition-colors hover:text-blue-400">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-slate-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                Built with ❤️ for developers worldwide
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <Link to="/sitemap" className="transition-colors hover:text-slate-300">
                  Sitemap
                </Link>
                <Link to="/accessibility" className="transition-colors hover:text-slate-300">
                  Accessibility
                </Link>
                <Link to="/cookies" className="transition-colors hover:text-slate-300">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
