import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function BlogPage() {
  return (
    <div className="bg-[#F7F5F5]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full h-[574px] md:h-[700px] rounded-[12px] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url(/blog-hero.png)" }}
        />
        <div className="absolute inset-0 bg-[rgba(18,18,18,0.31)]" />
        <div className="relative z-[2] h-full w-full flex items-end px-4 md:px-8 pb-6 md:pb-12">
          <div className="flex flex-col gap-4 max-w-[672px] w-full">
            <div className="inline-flex items-center h-[22px] px-[11px] py-[3px] rounded-full bg-white/90 md:bg-[#F25417] w-max">
              <span className="text-[#16181D] md:text-white text-[11px] font-bold leading-4">Featured Article</span>
            </div>
            <h1 className="text-white font-bold text-[32px] leading-[39px] md:text-[58px] md:leading-[60px]">
              The Future of Work in Africa: Flexible Spaces & Collaboration
            </h1>
            <p className="text-white/90 text-[16px] leading-[19px] md:text-[18px] md:leading-[28px]">
              Discover how coworking spaces are revolutionizing professional collaboration across African cities, creating opportunities for innovation and growth.
            </p>
            <div className="flex items-center gap-2 text-white/80 text-[14px] leading-[24px]">
              <span>March 15, 2024</span>
              <span>•</span>
              <span>8 min read</span>
            </div>
            <div>
              <button className="h-[50px] w-[185px] md:w-auto px-[25px] bg-[#F25417] text-white rounded-[8px]">Read Article →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main + Aside Container */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-10 md:mt-16 mb-5 lg:mt-20">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main */}
          <main className="flex lg:w-4/5 w-full flex-col gap-12">
            {/* Featured Articles */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[#121212] text-[24px] leading-8 font-bold">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <article key={i} className="bg-white rounded-[8px] shadow-sm overflow-hidden flex flex-col gap-6">
                    <div
                      className="relative h-[256px] md:h-[320px] bg-center bg-cover"
                      style={{ backgroundImage: "url(/blogpost-img.png)" }}
                    >
                      <div className="absolute left-4 top-4 h-[22px] px-[11px] py-[3px] bg-white/90 rounded-full text-[11px] font-bold text-[#121212]">
                        {i === 0 ? "Productivity" : i === 1 ? "Rapid Recruit" : "Projects"}
                      </div>
                    </div>
                    <div className="px-4 pb-6 flex flex-col gap-2">
                      <h3 className="text-[20px] leading-[28px] font-semibold text-[#16181D]">
                        {i === 0 && "Maximizing Productivity in Shared Workspaces"}
                        {i === 1 && "Rapid Recruit: Finding Top Talent Fast"}
                        {i === 2 && "Project Management in Flexible Teams"}
                      </h3>
                      <p className="text-[16px] leading-6 text-[#686767]">
                        {i === 0 && "Learn essential strategies for maintaining focus and efficiency in dynamic coworking environments."}
                        {i === 1 && "Discover how modern recruitment strategies are evolving to meet startup demands."}
                        {i === 2 && "Best practices for coordinating projects across distributed teams and hybrid work."}
                      </p>
                      <div className="flex items-center gap-2 text-[#657086] text-[12px] leading-4 pt-2">
                        <span>{i === 0 ? "March 14, 2024" : i === 1 ? "March 13, 2024" : "March 11, 2024"}</span>
                        <span>•</span>
                        <span>{i === 2 ? "7 min read" : "6 min read"}</span>
                      </div>
                      <button className="text-[#F25417] text-[13px] leading-5 mt-2 w-max">Read More →</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Recent Posts */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[#121212] text-[24px] leading-8 font-bold">Recent Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <article key={i} className="relative bg-white rounded-[8px] shadow-sm overflow-hidden">
                    <div className="p-0">
                      <div
                        className="relative h-[208px] md:h-[192px] bg-center bg-cover"
                        style={{ backgroundImage: "url(/blogpost-img.png)" }}
                      >
                        <div className="absolute left-4 top-4 h-[22px] px-[11px] py-[3px] bg-white/90 rounded-full text-[11px] font-bold text-[#16181D]">
                          {i % 2 === 0 ? "Coworking" : "Productivity"}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-[18px] leading-7 font-semibold text-[#16181D]">
                          {i === 0 && "The Economics of Coworking Spaces"}
                          {i === 1 && "Building Professional Networks"}
                          {i === 2 && "Remote Work Best Practices"}
                          {i === 3 && "Scaling Your Startup Team"}
                        </h3>
                        <p className="text-[14px] leading-5 text-[#686767]">
                          {i === 0 && "Understanding the business model and financial benefits of shared spaces."}
                          {i === 1 && "How coworking spaces facilitate meaningful professional connections."}
                          {i === 2 && "Tips and tools for productivity and balance in remote environments."}
                          {i === 3 && "Grow your team effectively while maintaining culture and efficiency."}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-[#686767] text-[12px]">
                            <span>{i === 0 ? "March 9, 2024" : i === 1 ? "March 7, 2024" : i === 2 ? "March 5, 2024" : "March 3, 2024"}</span>
                            <span>•</span>
                            <span>{i === 3 ? "9 min read" : i === 1 ? "4 min read" : "5 min read"}</span>
                          </div>
                          <button className="text-[#F25417] text-[13px]">Read More →</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button className="h-10 px-4 rounded-[6px] border border-gray-200 bg-white/50 text-[#121212] text-[13px]">← Previous</button>
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 rounded-[6px] bg-[#F25417] text-white text-[14px]">1</button>
                  <button className="h-9 w-9 rounded-[6px] border border-gray-200 text-[14px]">2</button>
                  <button className="h-9 w-9 rounded-[6px] border border-gray-200 text-[14px]">3</button>
                </div>
                <button className="h-10 px-4 rounded-[6px] border border-gray-200 bg-white text-[#121212] text-[13px]">Next →</button>
              </div>
            </section>
          </main>

          {/* Aside */}
          <aside className="flex flex-col gap-6">
            {/* Categories */}
            <div className="bg-white rounded-[8px] shadow-sm p-6">
              <h3 className="text-[16px] font-bold text-[#16181D] mb-4">Categories</h3>
              <div className="flex flex-col gap-2 text-[14px] text-[#16181D]">
                <div className="flex items-center justify-between">
                  <span>Coworking</span>
                  <span className="px-3 py-[3px] rounded-full bg-[#F3F4F6] text-[12px] font-bold text-[#121212]">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Productivity</span>
                  <span className="px-3 py-[3px] rounded-full bg-[#F3F4F6] text-[12px] font-bold text-[#121212]">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rapid Recruit</span>
                  <span className="px-3 py-[3px] rounded-full bg-[#F3F4F6] text-[12px] font-bold text-[#121212]">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Projects</span>
                  <span className="px-3 py-[3px] rounded-full bg-[#F3F4F6] text-[12px] font-bold text-[#121212]">10</span>
                </div>
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white rounded-[8px] shadow-sm p-6">
              <h3 className="text-[16px] font-bold text-[#16181D] mb-4">Popular Posts</h3>
              <div className="flex flex-col gap-4">
                {[
                  { title: "10 Tips for Remote Team Management", date: "March 12, 2024", read: "5 min read" },
                  { title: "Building Community in Coworking Spaces", date: "March 10, 2024", read: "7 min read" },
                  { title: "The Rise of Freelancing in Africa", date: "March 8, 2024", read: "6 min read" },
                ].map((p, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <h4 className="text-[#16181D] text-[14px] leading-6">{p.title}</h4>
                    <div className="flex items-center gap-2 text-[#686767] text-[11px]">
                      <span>{p.date}</span>
                      <span>•</span>
                      <span>{p.read}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}


