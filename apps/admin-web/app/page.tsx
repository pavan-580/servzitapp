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

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api/v1' : '')).replace(/\/$/, '');

export default function HomePage() {
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [providers, setProviders] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
      const response = await request('/admin/providers/review-queue', current);
      if (!response.ok) throw new Error(response.status === 403 ? 'This account is not permitted to open provider reviews.' : 'The review queue could not be loaded. Try again.');
      const payload = await response.json() as { items: ProviderReview[] };
      setProviders(payload.items);
    } catch (e) { setError(e instanceof Error ? e.message : 'The review queue could not be loaded.'); }
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
      const response = await request(`/admin/providers/${provider.providerId}/review`, session, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(response.status === 409 ? payload.message || 'This provider is not ready for that review decision.' : 'The review decision could not be saved.');
      setNotice(`Provider ${decision === 'in_review' ? 'moved to in review' : `${decision}d`}.`);
      await loadProviders(session);
    } catch (e) { setError(e instanceof Error ? e.message : 'The review decision could not be saved.'); }
    finally { setBusyId(null); }
  }

  async function signOut() {
    if (session) await request('/auth/session/logout', session, { method: 'POST' }).catch(() => undefined);
    setSession(null); setProviders([]); setNotice(null); setError(null); setOtpSent(false); setCode('');
  }

  return (
    <main className="shell">
      <aside className="rail"><div className="brandMark">S</div><span>OPERATIONS</span><nav aria-label="Main navigation"><a className="active" href="#overview">Overview</a>{session ? <a href="#provider-review">Provider review</a> : null}</nav><div className="railFoot">SERVZ'IT<br/><small>OWNER CONSOLE</small></div></aside>
      <section className="content" id="overview">
        <header><div><p className="eyebrow">MARKETPLACE CONTROL CENTER</p><h1>{session ? 'Provider review' : 'Owner sign in'}</h1><p className="muted">{session ? `Signed in as ${session.user.phoneE164}. Review queue data is loaded from the marketplace API.` : 'Use the owner phone account granted administrator access through the secure first-admin bootstrap.'}</p></div>{session ? <button className="button secondary small" onClick={() => void signOut()}>Sign out</button> : <div className="adminChip"><span className="statusDot"/>Protected access</div>}</header>

        {!session ? <section className="authCard" aria-labelledby="signin-title">
          <p className="eyebrow">OWNER ACCESS</p><h2 id="signin-title">Sign in securely.</h2>
          <p className="muted">Verification codes are sent through the configured phone provider. No development code is accepted.</p>
          <form onSubmit={(event) => void (otpSent ? verifyCode(event) : sendCode(event))}>
            <label htmlFor="admin-phone">Phone number</label>
            <input id="admin-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={otpSent || loading} placeholder="+91 98765 43210" />
            {otpSent ? <><label htmlFor="admin-code">Verification code</label><input id="admin-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={10} placeholder="Enter code" /></> : null}
            {error ? <p className="error" role="alert">{error}</p> : null}{notice ? <p className="success" role="status">{notice}</p> : null}
            <button className="button primary" disabled={loading}>{loading ? 'Please wait…' : otpSent ? 'Verify and continue' : 'Send verification code'}</button>
            {otpSent ? <button className="textButton" type="button" onClick={() => { setOtpSent(false); setCode(''); setNotice(null); }}>Change phone number</button> : null}
          </form>
          <p className="authFoot">Access tokens stay in memory for this browser session and are cleared when you sign out or close the page.</p>
        </section> : <>
          <div className="notice"><span>i</span><p><strong>Document review is required before approval.</strong><br/>Uploaded documents are not shown or treated as verified by this console. Approval is enabled only when identity and business documents have explicit approved review statuses.</p></div>
          {error ? <p className="error" role="alert">{error}</p> : null}{notice ? <p className="success" role="status">{notice}</p> : null}
          <section id="provider-review" aria-labelledby="queue-title">
            <div className="sectionHeading"><div><p className="eyebrow">TRUST & SAFETY</p><h2 id="queue-title">Provider review queue</h2></div><button className="button secondary small" onClick={() => session && void loadProviders(session)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
            {loading && providers.length === 0 ? <div className="stateCard" role="status">Loading provider applications…</div> : null}
            {!loading && providers.length === 0 ? <div className="stateCard"><strong>No profiles need review</strong><p>New provider applications will appear here after they are submitted.</p></div> : null}
            <div className="reviewList">{providers.map((provider) => {
              const identityApproved = provider.documents.some((document) => document.type === 'identity' && document.status === 'approved');
              const businessApproved = provider.documents.some((document) => document.type === 'business' && document.status === 'approved');
              const canApprove = identityApproved && businessApproved;
              return <article className="reviewCard" key={provider.providerId}>
                <div className="reviewHeader"><div><p className="eyebrow">{provider.accountType.replaceAll('_', ' ')}</p><h3>{provider.businessName}</h3><p className="muted">{provider.phoneE164} · Submitted {new Date(provider.createdAt).toLocaleDateString()}</p></div><span className={`reviewStatus ${provider.reviewStatus}`}>{provider.reviewStatus.replaceAll('_', ' ')}</span></div>
                <p className="reviewAddress">{provider.addressLines.join(', ') || 'No address supplied'}</p>
                <div className="documentGrid"><DocumentStatus label="Identity document" approved={identityApproved} /><DocumentStatus label="Business document" approved={businessApproved} /></div>
                {provider.documents.length ? <p className="muted docList">{provider.documents.map((document) => `${document.type}: ${document.status}`).join(' · ')}</p> : <p className="docWarning">No reviewable documents are on file.</p>}
                <div className="actions">
                  <button className="button primary" onClick={() => void review(provider, 'approve')} disabled={!canApprove || busyId === provider.providerId} title={!canApprove ? 'Identity and business documents must both be approved first.' : undefined}>{busyId === provider.providerId ? 'Saving…' : 'Approve and publish'}</button>
                  <button className="button secondary" onClick={() => void review(provider, 'in_review')} disabled={busyId === provider.providerId}>Mark in review</button>
                  <button className="button danger" onClick={() => void review(provider, 'reject')} disabled={busyId === provider.providerId}>Reject</button>
                </div>
              </article>;
            })}</div>
          </section>
          <section className="plannedModules"><p className="eyebrow">OTHER MODULES</p><h2>More operations tools are in progress</h2><p className="muted">User management, property review, booking operations, finance, CRM, and audit-log browsing are not connected in this release.</p></section>
        </>}
        <footer>Discover. Connect. Book. Grow. <span>© SERVZ'IT</span></footer>
      </section>
    </main>
  );
}

function DocumentStatus({ label, approved }: { label: string; approved: boolean }) {
  return <div className={`documentStatus ${approved ? 'approved' : 'pending'}`}><span aria-hidden="true">{approved ? '✓' : '•'}</span><span>{label}</span><strong>{approved ? 'Approved' : 'Pending review'}</strong></div>;
}
