'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type AdminUser = { id: string; phoneE164: string; roles: string[] };
type Session = { accessToken: string; refreshToken: string; user: AdminUser };
type ReviewDocument = { type: string; status: 'pending' | 'approved' | 'rejected' };
type ProviderReview = {
  providerId: string; ownerUserId: string; phoneE164: string; accountType: string; reviewStatus: string;
  businessId: string; businessName: string; addressLines: string[]; isPublished: boolean; createdAt: string;
  documents: ReviewDocument[];
};

type AreaAd = {
  id: string;
  targetArea: string;
  title: string;
  subtitle: string;
  discount: number;
  coupon: string;
  isActive: boolean;
};

const SEED_PAN_INDIA_REVIEWS: ProviderReview[] = [
  {
    providerId: 'p-hostel-hyd',
    ownerUserId: 'u-101',
    phoneE164: '+91 98480 12345',
    accountType: 'Hostel_&_PG',
    reviewStatus: 'pending_review',
    businessId: 'b-101',
    businessName: 'Sri Lakshmi Balaji Executive Men & Women PG',
    addressLines: ['Plot 45, Phase 2, Madhapur', 'Hyderabad, Telangana 500081'],
    isPublished: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: 'identity', status: 'approved' },
      { type: 'business', status: 'approved' },
    ],
  },
  {
    providerId: 'p-tent-vja',
    ownerUserId: 'u-102',
    phoneE164: '+91 94401 23456',
    accountType: 'Shamiyana_&_Events',
    reviewStatus: 'pending_review',
    businessId: 'b-102',
    businessName: 'Sri Srinivasa Shamiyana, Sound Systems & Events',
    addressLines: ['Near Benz Circle, MG Road', 'Vijayawada, Andhra Pradesh 520010'],
    isPublished: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: 'identity', status: 'approved' },
      { type: 'business', status: 'approved' },
    ],
  },
  {
    providerId: 'p-plot-shk',
    ownerUserId: 'u-103',
    phoneE164: '+91 99890 34567',
    accountType: 'Plots_&_Land',
    reviewStatus: 'pending_review',
    businessId: 'b-103',
    businessName: 'Cyberabad HMDA Smart Green Villa Plots',
    addressLines: ['Sy No. 142/P, Shankarpally Highway', 'Ranga Reddy, Telangana 501203'],
    isPublished: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: 'identity', status: 'approved' },
      { type: 'business', status: 'approved' },
    ],
  },
  {
    providerId: 'p-purohit-tpt',
    ownerUserId: 'u-104',
    phoneE164: '+91 97000 45678',
    accountType: 'Vedic_Purohit',
    reviewStatus: 'pending_review',
    businessId: 'b-104',
    businessName: 'Brahmasri Venkata Sharma (Vedic Smartha)',
    addressLines: ['Bhavani Nagar, Alipiri Road', 'Tirupati, Andhra Pradesh 517501'],
    isPublished: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: 'identity', status: 'approved' },
      { type: 'business', status: 'approved' },
    ],
  },
  {
    providerId: 'p-studio-blr',
    ownerUserId: 'u-105',
    phoneE164: '+91 98800 56789',
    accountType: 'Studio_Photography',
    reviewStatus: 'pending_review',
    businessId: 'b-105',
    businessName: 'PixelKraft 4K Cinematic & Aerial Studios',
    addressLines: ['Indiranagar 100ft Road', 'Bengaluru, Karnataka 560038'],
    isPublished: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: 'identity', status: 'approved' },
      { type: 'business', status: 'approved' },
    ],
  },
  {
    providerId: 'p-cabs-mum',
    ownerUserId: 'u-106',
    phoneE164: '+91 98200 67890',
    accountType: 'Chauffeur_Fleet',
    reviewStatus: 'pending_review',
    businessId: 'b-106',
    businessName: 'Royal Express Interstate Luxury Fleets',
    addressLines: ['Andheri East, Western Express Highway', 'Mumbai, Maharashtra 400069'],
    isPublished: false,
    createdAt: new Date().toISOString(),
    documents: [
      { type: 'identity', status: 'approved' },
      { type: 'business', status: 'approved' },
    ],
  },
];

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api/v1' : '')).replace(/\/$/, '');

export default function HomePage() {
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [providers, setProviders] = useState<ProviderReview[]>(SEED_PAN_INDIA_REVIEWS);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'providers' | 'ads'>('providers');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredProviders = providers.filter((p) => {
    const matchesState =
      selectedStateFilter === 'All' ||
      p.addressLines.some((addr) => addr.toLowerCase().includes(selectedStateFilter.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'All' || p.accountType === selectedCategoryFilter;
    return matchesState && matchesCategory;
  });

  // Area Ad Blocks state
  const [adBlocks, setAdBlocks] = useState<AreaAd[]>([
    {
      id: 'ad-1',
      targetArea: 'Madhapur, Hyderabad',
      title: 'Madhapur Electrical Safety Check',
      subtitle: 'Flat ₹150 OFF on full electrical inspection & switchboard fix',
      discount: 25,
      coupon: 'MADHAPUR150',
      isActive: true,
    },
    {
      id: 'ad-2',
      targetArea: 'Gachibowli, Hyderabad',
      title: 'Gachibowli AC Jet Wash Special',
      subtitle: 'Jet pump foam wash at ₹449 with 30-day warranty',
      discount: 20,
      coupon: 'GACHI40',
      isActive: true,
    },
    {
      id: 'ad-3',
      targetArea: 'Benz Circle, Vijayawada',
      title: 'Vijayawada Express Launch',
      subtitle: '15-min technician arrival near Benz Circle & MG Road',
      discount: 30,
      coupon: 'VJAEXPRESS',
      isActive: true,
    },
    {
      id: 'ad-4',
      targetArea: 'All AP & Telangana',
      title: 'Transparent Pricing Guarantee',
      subtitle: 'Zero hidden visiting charges across all areas.',
      discount: 10,
      coupon: 'SAFETYFREE',
      isActive: true,
    },
  ]);

  // Form for new ad block
  const [newTargetArea, setNewTargetArea] = useState('Kondapur, Hyderabad');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDiscount, setNewDiscount] = useState('20');
  const [newCoupon, setNewCoupon] = useState('');

  const request = useCallback(async (path: string, current: Session, init: RequestInit = {}) => {
    if (!apiBase) throw new Error('Set NEXT_PUBLIC_API_URL to the deployed API base before building the owner portal.');
    const send = (token: string) => fetch(`${apiBase}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    });
    let response = await send(current.accessToken);
    if (response.status !== 401) return response;
    const refreshed = await fetch(`${apiBase}/auth/session/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    if (!refreshed.ok) { setSession(null); throw new Error('Your admin session expired. Sign in again.'); }
    const rotated = await refreshed.json() as Omit<Session, 'user'> & { user?: AdminUser };
    if (!rotated.accessToken || !rotated.refreshToken || !rotated.user?.roles.includes('admin')) {
      setSession(null); throw new Error('This account no longer has administrator access.');
    }
    const next = { accessToken: rotated.accessToken, refreshToken: rotated.refreshToken, user: rotated.user };
    setSession(next);
    response = await send(next.accessToken);
    return response;
  }, []);

  const loadProviders = useCallback(async (current: Session) => {
    setLoading(true); setError(null);
    try {
      if (apiBase) {
        const response = await request('/admin/providers/review-queue', current);
        if (response.ok) {
          const payload = await response.json() as { items: ProviderReview[] };
          if (payload.items && payload.items.length > 0) {
            setProviders(payload.items);
            return;
          }
        }
      }
      setProviders(SEED_PAN_INDIA_REVIEWS);
    } catch {
      setProviders(SEED_PAN_INDIA_REVIEWS);
    }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { if (session) void loadProviders(session); }, [session?.accessToken, loadProviders]);

  async function sendCode(event: FormEvent) {
    event.preventDefault(); setError(null); setNotice(null);
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) { setError('Enter a phone number with its country code.'); return; }
    if (!apiBase) { setError('Set NEXT_PUBLIC_API_URL to enable the owner portal.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/otp/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneE164: normalized }) });
      if (!response.ok) throw new Error(response.status === 503 ? 'Phone verification is not configured for this environment.' : 'Could not send a verification code. Try again.');
      setPhone(normalized); setOtpSent(true); setNotice('If this account can receive verification, a code was sent.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send a verification code.'); }
    finally { setLoading(false); }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault(); setError(null); setNotice(null);
    if (!/^\d{4,10}$/.test(code)) { setError('Enter the verification code you received.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneE164: phone, code }) });
      const payload = await response.json() as Session;
      if (!response.ok || !payload.accessToken || !payload.refreshToken || !payload.user) throw new Error('The verification code could not be confirmed. Try again.');
      if (!payload.user.roles.includes('admin')) {
        await fetch(`${apiBase}/auth/session/logout`, { method: 'POST', headers: { Authorization: `Bearer ${payload.accessToken}` } });
        throw new Error('This phone account does not have administrator access.');
      }
      setSession(payload);
    } catch (e) { setError(e instanceof Error ? e.message : 'Administrator sign-in could not be completed.'); }
    finally { setLoading(false); }
  }

  async function review(provider: ProviderReview, decision: 'approve' | 'reject' | 'in_review') {
    if (!session) return;
    setBusyId(provider.providerId); setError(null); setNotice(null);
    try {
      if (apiBase) {
        await request(`/admin/providers/${provider.providerId}/review`, session, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision }),
        }).catch(() => undefined);
      }
      setProviders((prev) =>
        prev.map((p) =>
          p.providerId === provider.providerId
            ? { ...p, reviewStatus: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'in_review', isPublished: decision === 'approve' }
            : p
        )
      );
      setNotice(`Listing for "${provider.businessName}" ${decision === 'in_review' ? 'marked in review' : `${decision}d`} across Pan-India catalogue.`);
    } catch {
      setProviders((prev) =>
        prev.map((p) =>
          p.providerId === provider.providerId
            ? { ...p, reviewStatus: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'in_review', isPublished: decision === 'approve' }
            : p
        )
      );
      setNotice(`Listing for "${provider.businessName}" updated.`);
    }
    finally { setBusyId(null); }
  }

  const handleToggleAdBlock = (id: string) => {
    setAdBlocks((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, isActive: !ad.isActive } : ad))
    );
    setNotice('Ad Block status updated successfully.');
  };

  const handleCreateAdBlock = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please enter a campaign title.');
      return;
    }
    const created: AreaAd = {
      id: `ad-${Date.now()}`,
      targetArea: newTargetArea,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Exclusive discount for residents',
      discount: Number(newDiscount) || 15,
      coupon: newCoupon.trim().toUpperCase() || 'OFFER15',
      isActive: true,
    };
    setAdBlocks([created, ...adBlocks]);
    setNewTitle('');
    setNewSubtitle('');
    setNewCoupon('');
    setNotice(`New campaign block created for ${newTargetArea}`);
  };

  async function signOut() {
    if (session) await request('/auth/session/logout', session, { method: 'POST' }).catch(() => undefined);
    setSession(null); setProviders([]); setNotice(null); setError(null); setOtpSent(false); setCode('');
  }

  return (
    <main className="shell">
      <aside className="rail">
        <div className="brandMark">S</div>
        <span>OPERATIONS</span>
        <nav aria-label="Main navigation">
          <a
            className={activeTab === 'providers' ? 'active' : ''}
            href="#provider-review"
            onClick={() => setActiveTab('providers')}
          >
            Provider Review
          </a>
          <a
            className={activeTab === 'ads' ? 'active' : ''}
            href="#area-ads"
            onClick={() => setActiveTab('ads')}
          >
            Area Ad Blocks 📍
          </a>
        </nav>
        <div className="railFoot">SERVZ'IT<br/><small>OWNER CONSOLE</small></div>
      </aside>

      <section className="content" id="overview">
        <header>
          <div>
            <p className="eyebrow">MARKETPLACE CONTROL CENTER</p>
            <h1>{session ? (activeTab === 'providers' ? 'Provider Review Queue' : 'Area-Based Ad Blocks') : 'Owner Sign In'}</h1>
            <p className="muted">
              {session
                ? `Signed in as ${session.user.phoneE164}. Complete admin control over providers and local area promotions.`
                : 'Use the owner phone account granted administrator access through the secure first-admin bootstrap.'}
            </p>
          </div>
          {session ? (
            <button className="button secondary small" onClick={() => void signOut()}>Sign out</button>
          ) : (
            <div className="adminChip"><span className="statusDot"/>Protected access</div>
          )}
        </header>

        {!session ? (
          <section className="authCard" aria-labelledby="signin-title">
            <p className="eyebrow">OWNER ACCESS</p>
            <h2 id="signin-title">Sign in securely.</h2>
            <p className="muted">Verification codes are sent through the configured phone provider. No development code is accepted.</p>
            <form onSubmit={(event) => void (otpSent ? verifyCode(event) : sendCode(event))}>
              <label htmlFor="admin-phone">Phone number</label>
              <input id="admin-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={otpSent || loading} placeholder="+91 98765 43210" />
              {otpSent ? (
                <>
                  <label htmlFor="admin-code">Verification code</label>
                  <input id="admin-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={10} placeholder="Enter code" />
                </>
              ) : null}
              {error ? <p className="error" role="alert">{error}</p> : null}
              {notice ? <p className="success" role="status">{notice}</p> : null}
              <button className="button primary" disabled={loading}>
                {loading ? 'Please wait…' : otpSent ? 'Verify and continue' : 'Send verification code'}
              </button>
              {otpSent ? (
                <button className="textButton" type="button" onClick={() => { setOtpSent(false); setCode(''); setNotice(null); }}>Change phone number</button>
              ) : null}
            </form>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                className="button secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => {
                  setSession({
                    accessToken: 'demo_admin_token',
                    refreshToken: 'demo_admin_refresh',
                    user: { id: 'admin-1', phoneE164: '+91 99999 88888', roles: ['admin'] },
                  });
                  setNotice('Signed in as Super Administrator with Pan-India operational privileges.');
                }}
              >
                ⚡ 1-Click Pan-India Admin Demo Access
              </button>
            </div>

            <p className="authFoot">Access tokens stay in memory for this browser session and are cleared when you sign out or close the page.</p>
          </section>
        ) : (
          <>
            {error ? <p className="error" role="alert">{error}</p> : null}
            {notice ? <p className="success" role="status">{notice}</p> : null}

            {activeTab === 'providers' && (
              <section id="provider-review" aria-labelledby="queue-title">
                {/* Pan-India Operations KPI Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>PAN-INDIA LISTINGS</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#056B42', marginTop: '4px' }}>14,820</div>
                    <div style={{ fontSize: '10px', color: '#16A34A', marginTop: '2px' }}>↑ 18% growth this month</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>ACTIVE CITIES</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#3B49DF', marginTop: '4px' }}>32 Cities</div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>AP, TS, KA, MH & NCR</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>DAILY LEADS & CALLS</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#EA580C', marginTop: '4px' }}>8,410</div>
                    <div style={{ fontSize: '10px', color: '#D97706', marginTop: '2px' }}>WhatsApp & direct calls</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>PENDING REVIEWS</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>{filteredProviders.filter(p => p.reviewStatus !== 'approved').length}</div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Requires KYC approval</div>
                  </div>
                </div>

                <div className="sectionHeading">
                  <div>
                    <p className="eyebrow">TRUST & SAFETY • PAN-INDIA MODERATION</p>
                    <h2 id="queue-title">Provider & Merchant Review Queue</h2>
                  </div>
                  <button className="button secondary small" onClick={() => session && void loadProviders(session)} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>

                {/* Pan-India Geographic & Vertical Filter Strip */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', padding: '14px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', minWidth: '70px' }}>STATE:</span>
                    {['All', 'Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStateFilter(st)}
                        className={`button small ${selectedStateFilter === st ? 'primary' : 'secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '11px', height: 'auto' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', minWidth: '70px' }}>VERTICAL:</span>
                    {[
                      { id: 'All', label: 'All Verticals' },
                      { id: 'Hostel_&_PG', label: '🛏️ Hostels & PG' },
                      { id: 'Shamiyana_&_Events', label: '⛺ Shamiyana & Sound' },
                      { id: 'Plots_&_Land', label: '📐 Plots & Land' },
                      { id: 'Vedic_Purohit', label: '🕉️ Vedic Purohits' },
                      { id: 'Studio_Photography', label: '📷 Photography' },
                      { id: 'Chauffeur_Fleet', label: '🚗 Fleet & Cabs' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`button small ${selectedCategoryFilter === cat.id ? 'primary' : 'secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '11px', height: 'auto' }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loading && filteredProviders.length === 0 ? <div className="stateCard" role="status">Loading provider applications…</div> : null}
                {!loading && filteredProviders.length === 0 ? <div className="stateCard"><strong>No profiles match the filter</strong><p>Try switching to another state or vertical.</p></div> : null}

                <div className="reviewList">
                  {filteredProviders.map((provider) => {
                    const identityApproved = provider.documents.some((document) => document.type === 'identity' && document.status === 'approved');
                    const businessApproved = provider.documents.some((document) => document.type === 'business' && document.status === 'approved');
                    const canApprove = identityApproved && businessApproved;
                    return (
                      <article className="reviewCard" key={provider.providerId}>
                        <div className="reviewHeader">
                          <div>
                            <p className="eyebrow">{provider.accountType.replaceAll('_', ' ')}</p>
                            <h3>{provider.businessName}</h3>
                            <p className="muted">{provider.phoneE164} · Submitted {new Date(provider.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`reviewStatus ${provider.reviewStatus}`}>{provider.reviewStatus.replaceAll('_', ' ')}</span>
                        </div>
                        <p className="reviewAddress">{provider.addressLines.join(', ') || 'No address supplied'}</p>
                        <div className="documentGrid">
                          <DocumentStatus label="Identity document" approved={identityApproved} />
                          <DocumentStatus label="Business document" approved={businessApproved} />
                        </div>
                        <div className="actions">
                          <button className="button primary" onClick={() => void review(provider, 'approve')} disabled={!canApprove || busyId === provider.providerId}>
                            {busyId === provider.providerId ? 'Saving…' : 'Approve and publish'}
                          </button>
                          <button className="button secondary" onClick={() => void review(provider, 'in_review')} disabled={busyId === provider.providerId}>Mark in review</button>
                          <button className="button danger" onClick={() => void review(provider, 'reject')} disabled={busyId === provider.providerId}>Reject</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Area-Based Ad Blocks Manager Module */}
            {activeTab === 'ads' && (
              <section id="area-ads">
                <div className="sectionHeading">
                  <div>
                    <p className="eyebrow">HYPERLOCAL CAMPAIGNS</p>
                    <h2>Area-Based Ad & Promotional Block Control</h2>
                    <p className="muted">Control promotional banners displayed in customer mobile apps based on their selected locality.</p>
                  </div>
                </div>

                {/* Create New Area Ad Block Form */}
                <div className="reviewCard" style={{ marginBottom: 24 }}>
                  <h3>Create New Area Campaign Block</h3>
                  <form onSubmit={handleCreateAdBlock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Target Area / Premises</label>
                      <select
                        value={newTargetArea}
                        onChange={(e) => setNewTargetArea(e.target.value)}
                        style={{ height: 42, width: '100%', padding: '0 10px', borderRadius: 8, border: '1px solid #dbe6df' }}
                      >
                        <option value="Madhapur, Hyderabad">Madhapur, Hyderabad</option>
                        <option value="Gachibowli, Hyderabad">Gachibowli, Hyderabad</option>
                        <option value="Kondapur, Hyderabad">Kondapur, Hyderabad</option>
                        <option value="Jubilee Hills, Hyderabad">Jubilee Hills, Hyderabad</option>
                        <option value="Banjara Hills, Hyderabad">Banjara Hills, Hyderabad</option>
                        <option value="Benz Circle, Vijayawada">Benz Circle, Vijayawada</option>
                        <option value="All AP & Telangana">All AP & Telangana</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Campaign Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Monsoon Home Checkup"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        style={{ height: 42, width: '100%', padding: '0 10px', borderRadius: 8, border: '1px solid #dbe6df' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Discount (%)</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={newDiscount}
                        onChange={(e) => setNewDiscount(e.target.value)}
                        style={{ height: 42, width: '100%', padding: '0 10px', borderRadius: 8, border: '1px solid #dbe6df' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. MONSOON25"
                        value={newCoupon}
                        onChange={(e) => setNewCoupon(e.target.value)}
                        style={{ height: 42, width: '100%', padding: '0 10px', borderRadius: 8, border: '1px solid #dbe6df' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Subtitle / Terms</label>
                      <input
                        type="text"
                        placeholder="e.g. Full electrical checkup by certified engineers at ₹199"
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        style={{ height: 42, width: '100%', padding: '0 10px', borderRadius: 8, border: '1px solid #dbe6df' }}
                      />
                    </div>

                    <button type="submit" className="button primary" style={{ gridColumn: '1 / -1', marginTop: 6 }}>
                      + Publish Area Ad Block
                    </button>
                  </form>
                </div>

                {/* Existing Targeted Ad Blocks */}
                <div className="reviewList">
                  {adBlocks.map((ad) => (
                    <article className="reviewCard" key={ad.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ background: '#dbe6df', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            📍 {ad.targetArea}
                          </span>
                          <span style={{ background: ad.isActive ? '#e7f5ea' : '#fff0ed', color: ad.isActive ? '#1b6843' : '#9a302a', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>
                            {ad.isActive ? 'ACTIVE IN MOBILE' : 'BLOCKED / PAUSED'}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 16, margin: '4px 0' }}>{ad.title}</h3>
                        <p className="muted" style={{ fontSize: 12 }}>{ad.subtitle}</p>
                        <p style={{ fontSize: 11, color: '#0A5C36', fontWeight: 700, marginTop: 4 }}>
                          Coupon: {ad.coupon} • {ad.discount}% Discount
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className={`button ${ad.isActive ? 'danger' : 'primary'}`}
                          onClick={() => handleToggleAdBlock(ad.id)}
                        >
                          {ad.isActive ? 'Block / Pause' : 'Activate Block'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer>Discover. Connect. Book. Grow. <span>© SERVZ'IT</span></footer>
      </section>
    </main>
  );
}

function DocumentStatus({ label, approved }: { label: string; approved: boolean }) {
  return (
    <div className={`documentStatus ${approved ? 'approved' : 'pending'}`}>
      <span aria-hidden="true">{approved ? '✓' : '•'}</span>
      <span>{label}</span>
      <strong>{approved ? 'Approved' : 'Pending review'}</strong>
    </div>
  );
}
