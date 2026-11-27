export type TabId = "explore" | "pipeline" | "offers";

interface AppHeaderProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  applicationCount: number;
  offerCount: number;
  onAddApplicationClick: () => void;
}

// Navbar desain Rifqi (.navbar, .navbar-inner, .logo) diisi tab sesuai wireframe
export function AppHeader({
  activeTab,
  onChangeTab,
  applicationCount,
  offerCount,
  onAddApplicationClick,
}: AppHeaderProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "explore", label: "Eksplorasi Lowongan" },
    { id: "pipeline", label: `Pipeline Lamaran (${applicationCount})` },
    { id: "offers", label: `Bandingkan Offer (${offerCount})` },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner app-navbar">
        <a
          href="#"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            onChangeTab("explore");
          }}
        >
          Aku Mw <span>Magang</span>
        </a>

        <nav className="nav-tabs" aria-label="Navigasi utama">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? "nav-tab nav-tab-active" : "nav-tab"}
              aria-current={tab.id === activeTab ? "page" : undefined}
              onClick={() => onChangeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" className="btn-cta" onClick={onAddApplicationClick}>
            + Catat Lamaran
          </button>
        </div>
      </div>
    </header>
  );
}
