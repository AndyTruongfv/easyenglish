import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import blogContent from "@/data/blog_content.json";
import { ClozeView } from "@/routes/_authenticated/lesson.$courseId.$lessonId";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/article/$articleId")({
  component: ArticleView,
});

function ArticleView() {
  const { articleId } = useParams({ from: "/_authenticated/article/$articleId" });
  const article: any = blogContent.find((a: any) => a.id === articleId);

  if (!article) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-extrabold text-muted-foreground">Article not found.</h2>
      </div>
    );
  }

  // Handle mock lesson next function for the embedded exercises
  const handleNext = () => {
    alert("Exercise Complete! You earned 10 Gems! 💎");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Article Header */}
      <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-primary" size={28} />
          <div className="flex gap-2">
            {article.categories.map((cat: any, i: any) => (
              <span key={i} className="text-xs font-extrabold text-primary uppercase tracking-wider px-3 py-1 bg-primary/10 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
          {article.title}
        </h1>
      </div>

      {/* Article Content */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-lg border border-white/10 prose prose-lg prose-slate dark:prose-invert max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: article.htmlContent }}
          className="blog-content"
        />
      </div>

      {/* Embedded Exercise */}
      {article.cloze && article.cloze.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✍️</span>
            <h2 className="text-2xl font-extrabold">Practice Time</h2>
          </div>
          <div className="glass-panel p-1 rounded-3xl shadow-2xl border border-white/20">
             <ClozeView 
                q={article.cloze[0]} 
                onNext={handleNext} 
             />
          </div>
        </div>
      )}
      
      {article.quiz && article.quiz.length > 0 && (
         <div className="mt-12 glass-panel p-8 rounded-3xl shadow-xl text-center">
             <h2 className="text-2xl font-extrabold mb-4">Multiple Choice Quiz</h2>
             <p className="text-muted-foreground mb-6">Interactive quiz coming soon...</p>
             <div className="space-y-4 text-left max-w-xl mx-auto">
                 <div className="font-bold text-lg">{article.quiz[0].question}</div>
                 {article.quiz[0].choices.map((choice: any, i: any) => (
                    <button key={i} className="w-full text-left px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition">
                        {choice}
                    </button>
                 ))}
             </div>
         </div>
      )}

      {article.pairs && article.pairs.length > 0 && (
         <div className="mt-12 glass-panel p-8 rounded-3xl shadow-xl text-center">
             <h2 className="text-2xl font-extrabold mb-4">Matching Game</h2>
             <p className="text-muted-foreground">Interactive matching coming soon...</p>
         </div>
      )}

      {/* Add custom CSS for the injected blog content */}
      <style>{`
        .blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 1rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            margin: 2rem auto;
        }
        .blog-content p {
            line-height: 1.8;
            margin-bottom: 1.5rem;
            color: hsl(var(--foreground));
        }
        .blog-content span {
            /* Override old blog hardcoded colors to fit modern theme */
            color: inherit !important;
            background-color: transparent !important;
        }
        .blog-content ._table_font {
            display: block;
            margin-bottom: 1rem;
            padding: 1rem;
            background: rgba(var(--primary), 0.05);
            border-left: 4px solid hsl(var(--primary));
            border-radius: 0 0.5rem 0.5rem 0;
        }
        .blog-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
            text-underline-offset: 4px;
        }
        .blog-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
        }
        .blog-content li {
            margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
