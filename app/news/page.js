import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

// Add new announcements here as the election progresses — newest first.
const NEWS = [
  {
    date: "Coming soon",
    title: "Application window opens",
    body: "Announcements about the election will be posted here as they happen — application updates, voting reminders, and results.",
  },
];

export default function NewsPage() {
  return (
    <>
      <Nav />
      <div className="page-header">
        <div className="wrap-narrow">
          <h1>News & Announcements</h1>
          <p>Updates on the election as they happen.</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap-narrow">
          {NEWS.map((item, i) => (
            <div className="news-item" key={i}>
              <div className="news-date">{item.date}</div>
              <div className="news-title">{item.title}</div>
              <div className="news-body">{item.body}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
