#!/usr/bin/env python3
"""Build the Thought Leadership persona pages (Wave 1).

Generates four pages under thought-leadership/ from shared components lifted
verbatim from thought-leadership.html plus per-page final copy. Also prints the
Part B persona-card section for insertion into thought-leadership.html.

Run from repo root: python3 scripts/build_tl_personas.py
"""
import os, re, html, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "thought-leadership.html")
OUTDIR = os.path.join(ROOT, "thought-leadership")

LANDBOT = "https://landbot.online/v3/H-2201411-ZNNL8EM9RF7C2XAC/index.html"
DEMAND = "/competitor-intel-report"

# ---- lift the main <style> block verbatim from the live TL page --------------
_src = open(SRC, encoding="utf-8").read()
_i = _src.index("<style>")
_j = _src.index("</style>", _i) + len("</style>")
STYLE = _src[_i:_j].replace("—", "-")  # strip em dashes from lifted CSS comments

EXTRA_STYLE = """<style>
.midcta-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:24px 30px;max-width:1000px;margin:0 auto}
.midcta-txt{font-size:19px;color:var(--text);line-height:1.4}
.midcta-txt span{color:var(--text-muted);font-size:16px}
.midcta-btns{display:flex;gap:12px;flex-wrap:wrap;flex-shrink:0}
@media(max-width:680px){.midcta-inner{flex-direction:column;align-items:flex-start}}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
@media(max-width:820px){.grid-3{grid-template-columns:1fr}}
.p-list{list-style:none;display:grid;gap:14px;margin-top:8px}
.p-list li{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:18px 22px}
.p-list li b{display:block;color:var(--text);font-size:1.04rem;margin-bottom:6px;line-height:1.3}
.p-list li p{color:var(--text-muted);font-size:.98rem;line-height:1.55;margin:0}
.risk-line{margin-top:14px;font-family:var(--font-mono);font-size:13px;letter-spacing:.03em;color:var(--text-faint)}
.foundoc{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:8px}
.stat-strip .num.txt{font-size:clamp(1rem,1.7vw,1.25rem);line-height:1.15;font-weight:800}
.eng-cta{display:inline-block;margin-top:26px;font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--accent);text-decoration:none}
.eng-cta:hover{color:var(--text)}
.xrow{display:flex;gap:16px;flex-wrap:wrap;margin-top:26px}
.xrow a{font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--accent);text-decoration:none}
.xrow a:hover{color:var(--text)}
</style>"""

NAV = """<nav class="rd-nav" id="top">
  <div class="rd-nav-inner">
    <a class="rd-logo" href="/">
      <img class="rd-logo-dark" src="/assets/img/logo-dark.svg" alt="Impactable" width="146" height="26">
      <img class="rd-logo-light" src="/assets/img/logo-light.svg" alt="Impactable" width="146" height="26">
    </a>
    <button class="rd-toggle" id="rdToggle" aria-label="Menu" aria-expanded="false">&#9776;</button>
    <div class="rd-menu" id="rdMenu">
      <div class="rd-item">
        <button class="rd-trigger" aria-haspopup="true" aria-expanded="false">
          Services
          <span class="rd-chevron" aria-hidden="true"></span>
        </button>
        <div class="rd-mega wide">
          <div class="rd-grid svc">
            <div class="rd-col">
              <span class="rd-h">LinkedIn Ads</span>
              <a href="/linkedin-ads-agency" class="rd-feature">B2B LinkedIn Ads Agency<small>Built on LinkedIn as your signals hub</small></a>
              <a href="/linkedin-launch">New to LinkedIn Ads<small>Launch on a validated system</small></a>
              <a href="/linkedin-scale">Scaling LinkedIn Ads<small>Already live, ready to grow</small></a>
              <a href="/linkedin-ads-audit">LinkedIn Ads Audit<small>A 35-point account inspection</small></a>
            </div>
            <div class="rd-col">
              <span class="rd-h">By industry</span>
              <a href="/linkedin-ads-for-saas">LinkedIn Ads for SaaS<small>The team behind HeyReach's 20X</small></a>
              <a href="/linkedin-ads-for-cybersecurity">LinkedIn Ads for Cybersecurity<small>The team behind Lacework's 6X</small></a>
              <a href="/linkedin-ads-for-financial-services">LinkedIn Ads for Financial Services<small>Compliance-aware campaigns</small></a>
              <a href="/linkedin-ads-by-industry" class="rd-feature">All industries<small>See every vertical</small></a>
            </div>
            <div class="rd-col">
              <span class="rd-h">Everything else</span>
              <a href="/google">B2B Paid Search<small>Google and LinkedIn, as one system</small></a>
              <a href="/marketing-ecosystem">B2B Facebook<small>Paid social that supports the funnel</small></a>
              <a href="/programmatic">Programmatic<small>Display and retargeting at scale</small></a>
              <a href="/thought-leadership">Thought Leadership<small>Founder-led Brand Engine</small></a>
              <a href="/activation">Outreach &amp; Activation<small>Signals into conversations</small></a>
            </div>
          </div>
        </div>
      </div>
      <div class="rd-item">
        <button class="rd-trigger" aria-haspopup="true" aria-expanded="false">
          Events &amp; Resources
          <span class="rd-chevron" aria-hidden="true"></span>
        </button>
        <div class="rd-mega">
          <div class="rd-grid" style="grid-template-columns:1fr;min-width:250px">
            <div class="rd-col">
              <span class="rd-h">Events &amp; resources</span>
              <a href="/events-resources">Events &amp; Community<small>Live sessions and community</small></a>
              <a href="/marketing-ecosystem">The Marketing Ecosystem<small>How every channel connects</small></a>
              <a href="https://impactable.com/blog/">Growth Lab<small>Blog &amp; insights</small></a>
              <a href="https://impactable.com/impactable-about-us/">About Us<small>Who we are and the team</small></a>
            </div>
          </div>
        </div>
      </div>
      <a class="rd-link" href="/intelligence-room">Strategy + Diagnostics</a>
      <a class="rd-link" href="/pricing">Pricing</a>
      <a class="rd-cta rd-cta-mobile" href="/competitor-intel-report#get-report">Free Demand Plan</a>
    </div>
        <a class="rd-cta rd-cta-desk" href="/competitor-intel-report#get-report">Free Demand Plan</a>
  </div>
</nav>"""

FOOTER = """<footer class="rd-foot">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <img src="/assets/img/logo-impactable-dark.svg" alt="Impactable">
        <div class="foot-tag">Built by LinkedIn insiders. Scaled by data.</div>
        <a class="btn btn-primary" href="%LANDBOT%">BOOK A CALL &rarr;</a>
      </div>
      <div class="foot-cols">
        <div class="foot-col">
          <h5>Services</h5>
          <a href="/competitor-intel-report">Free Competitor Intel Report</a>
          <a href="/linkedin-scale">LinkedIn Ads Management</a>
          <a href="/google">B2B Paid Search</a>
          <a href="/thought-leadership">Demand Gen Strategy</a>
        </div>
        <div class="foot-col">
          <h5>Thought Leadership by role</h5>
          <a href="/thought-leadership/saas-founders">SaaS Founders</a>
          <a href="/thought-leadership/coaching-training">Coaches &amp; Training Firms</a>
          <a href="/thought-leadership/consulting">Consulting Firms</a>
          <a href="/thought-leadership/it-services">IT Services &amp; MSPs</a>
        </div>
        <div class="foot-col">
          <h5>Company</h5>
          <a href="https://impactable.com/impactable-about-us/">About Us</a>
          <a href="https://impactable.com/">Careers</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
       <div class="foot-legal">
        <span>&copy; 2026 Impactable LLC · LinkedIn Marketing Partner</span>
        <img class="partner-logo" src="/img/marketing-partner-logo.svg" alt="LinkedIn Marketing Partner" width="120" height="43">
      </div>
      <div class="foot-social">
        <a href="https://www.linkedin.com/company/impactableb2b/" target="_blank" rel="noopener" aria-label="Impactable on LinkedIn"><img src="/assets/img/foot-linkedin.svg" alt="" width="16" height="16"></a>
        <a href="https://www.youtube.com/@Impactable-B2B-Agency" target="_blank" rel="noopener" aria-label="Impactable on YouTube"><img src="/assets/img/foot-youtube.svg" alt="" width="16" height="16"></a>
      </div>
    </div>
  </div>
</footer>""".replace("%LANDBOT%", LANDBOT)

TAIL = """<!-- Vercel Web Analytics -->
<script>
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
</script>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/track.js"></script>
<script src="/assets/js/chrome.js"></script>
<script>
(function(){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0.1});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
})();
</script>
</body>
</html>"""

# ---- shared body fragments ---------------------------------------------------
STATBAR = """      <div class="stat-strip reveal">
        <div class="stat"><div class="num">$50M<span class="a">+</span></div><div class="lbl">Ad spend managed</div></div>
        <div class="stat"><div class="num">28.8k<span class="a">+</span></div><div class="lbl">Newsletter subs, built this way</div></div>
        <div class="stat"><div class="num txt">Thought Leader<br>of the Year</div><div class="lbl">LinkedIn, 2026</div></div>
        <div class="stat"><div class="num txt">Certified</div><div class="lbl">LinkedIn Marketing Partner</div></div>
      </div>"""

def cta_pair(ghost=True):
    g = "btn-ghost" if ghost else "btn-ghost"
    return (f'<a href="{DEMAND}" class="btn btn-primary">Get your free Demand Plan &rarr;</a>\n'
            f'        <a href="{LANDBOT}" class="btn {g}">Book a call</a>')

MIDCTA = f"""<section class="band midcta" style="border-top:1px solid var(--line-soft)">
  <div class="wrap">
    <div class="midcta-inner reveal">
      <div class="midcta-txt"><b>Seen enough?</b> <span>Start free, or grab 15 minutes with us.</span></div>
      <div class="midcta-btns">
        <a class="btn btn-primary" href="{DEMAND}">Get your free Demand Plan &rarr;</a>
        <a class="btn btn-ghost" href="{LANDBOT}">Book a call</a>
      </div>
    </div>
  </div>
</section>"""

ENGINE = f"""<!-- [A3] THE ENGINE -->
<section class="band dark" id="engine">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>The engine</span>
      <h2>Not a content service. <span class="mk">A brand brain.</span></h2>
      <p>Real expertise goes in. A governed knowledge base holds your voice, positioning and proof, and the five foundational documents that run it. Sharp, on-brand assets come out, everywhere.</p>
    </div>
    <div class="build-grid">
      <div class="io-list reveal">
        <div class="io-k">&rarr; Inputs</div>
        <div class="io-chip">Founder &amp; expert interviews<span>the unique POV, captured</span></div>
        <div class="io-chip">Sales-call language<span>how buyers actually talk</span></div>
        <div class="io-chip">Positioning &amp; white space<span>what only you can claim</span></div>
        <div class="io-chip">Proof, frameworks &amp; ICP<span>the evidence and the audience</span></div>
      </div>
      <div class="reveal" style="display:grid;place-items:center;">
        <svg viewBox="0 0 300 300" style="width:100%;max-width:320px;" role="img" aria-label="The engine connects inputs to outputs">
          <circle class="orb-pulse v-accent2" cx="150" cy="150" r="110" opacity=".10"/>
          <g class="orb-ring1"><circle cx="150" cy="150" r="118" fill="none" class="v-accent-s" stroke-width="1" stroke-dasharray="2 9" opacity=".5"/></g>
          <path d="M10,150 H86" class="v-canopy-s" stroke-width="2" stroke-dasharray="4 5" opacity=".7"/>
          <path d="M214,150 H290" class="v-accent-s" stroke-width="2" stroke-dasharray="4 5" opacity=".7"/>
          <circle cx="150" cy="150" r="64" class="v-surf" stroke-width="1.5" style="stroke:var(--border-2)"/>
          <circle cx="150" cy="150" r="64" fill="url(#og2)"/>
          <text x="150" y="142" text-anchor="middle" class="v-text" font-size="13" font-weight="800">BRAND</text>
          <text x="150" y="160" text-anchor="middle" class="v-accent" font-size="13" font-weight="800">BRAIN</text>
          <text x="150" y="178" text-anchor="middle" class="v-faint mono" font-size="8">governed &middot; current &middot; yours</text>
          <defs><radialGradient id="og2" cx="50%" cy="40%"><stop offset="0%" stop-color="rgba(30,120,200,0.30)"/><stop offset="100%" stop-color="rgba(30,120,200,0)"/></radialGradient></defs>
        </svg>
      </div>
      <div class="io-list out reveal">
        <div class="io-k" style="color:var(--accent);text-align:right;">Outputs &larr;</div>
        <div class="io-chip">LinkedIn posts &amp; thought-leader ads</div>
        <div class="io-chip">Newsletters &amp; YouTube scripts</div>
        <div class="io-chip">Landing page &amp; ad copy</div>
        <div class="io-chip">Blogs &amp; long-form</div>
      </div>
    </div>
    <div class="reveal" style="margin-top:44px;">
      <div class="io-k" style="margin-bottom:12px;">The five foundational documents</div>
      <div class="foundoc">
        <div class="io-chip">Competitor Landscape</div>
        <div class="io-chip">Audience Targeting</div>
        <div class="io-chip">Message &amp; Offer Architecture</div>
        <div class="io-chip">Brand Voice DNA</div>
        <div class="io-chip">Founder &amp; Expert Voice DNA</div>
      </div>
    </div>
    <div class="grid-3 reveal" style="margin-top:44px;">
      <div class="pillar"><div class="io-k">Phase 1</div><h4>Voice Discovery &amp; Calibration</h4><p style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-faint);margin-top:6px;">~19-24 business days</p></div>
      <div class="pillar"><div class="io-k">Phase 2</div><h4>First Content Batch</h4><p style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-faint);margin-top:6px;">~8-10 days</p></div>
      <div class="pillar"><div class="io-k">Phase 3</div><h4>Approve &amp; Launch</h4><p style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-faint);margin-top:6px;">~4-6 days</p></div>
    </div>
    <p class="reveal" style="margin-top:22px;font-size:1rem;color:var(--text-muted);max-width:80ch;">Nine milestones, about 4 to 6 weeks. Phase 1 moves at the speed of your turnaround. Block 30 minutes per feedback round and we hold the 4-6 week window.</p>
    <a class="eng-cta reveal" href="/thought-leadership">See the full engine &rarr;</a>
  </div>
</section>"""

def maturity(stage_label):
    return f"""<!-- [A4] WHERE YOU ARE -->
<section class="band" id="stage">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>Where you are</span>
      <h2>The play changes with your stage. <span class="text-accent">The engine doesn't.</span></h2>
      <p>Founder and expert-led thought leadership is where it begins, and the layer that keeps compounding to category leadership. Find your stage, and we'll tell you what to lead with.</p>
    </div>
    <div class="viz reveal">
      <svg viewBox="0 0 900 280" role="img" aria-label="Growth Maturity Mountain, an ascending curve with five stages">
        <defs><linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(30,120,200,0.30)"/><stop offset="100%" stop-color="rgba(30,120,200,0)"/></linearGradient></defs>
        <line x1="40" y1="240" x2="880" y2="240" class="v-stroke" stroke-width="1"/>
        <path d="M40,232 C200,210 300,150 420,140 S640,90 880,40 L880,240 L40,240 Z" fill="url(#mtn)"/>
        <path d="M40,232 C200,210 300,150 420,140 S640,90 880,40" fill="none" class="v-accent-s" stroke-width="3"/>
        <g>
          <circle cx="120" cy="222" r="7" class="v-canopy"/>
          <circle cx="320" cy="160" r="6" class="v-accent"/>
          <circle cx="500" cy="128" r="6" class="v-accent"/>
          <circle cx="690" cy="86" r="6" class="v-accent"/>
          <circle cx="860" cy="46" r="7" class="v-accent"/>
        </g>
        <text x="120" y="206" text-anchor="middle" class="v-canopy mono" font-size="9" font-weight="700">START HERE</text>
      </svg>
      <div class="stages-cap">
        <div><div class="sn">Stage 1</div><h4>Validate</h4><p>Message-market fit. First conversions.</p></div>
        <div><div class="sn">Stage 2</div><h4>Ramp</h4><p>Attribution proven. Scaling begins.</p></div>
        <div><div class="sn">Stage 3</div><h4>Reach</h4><p>Demand gen for out-of-market buyers.</p></div>
        <div><div class="sn">Stage 4</div><h4>Supply</h4><p>Multi-channel at scale. Predictable pipeline.</p></div>
        <div><div class="sn">Stage 5</div><h4>Sustain</h4><p>Optimized economics. Brand compounds.</p></div>
      </div>
    </div>
    <p class="reveal" style="margin-top:22px;font-size:1rem;color:var(--text-muted);max-width:88ch;font-style:italic;">{stage_label}</p>
  </div>
</section>"""

def pricing(recommended, addon, show_system):
    # recommended in {"Thought Leader","Content Engine","Brand Engine"}
    def ribbon(name):
        return '<div class="ribbon">&starf; Recommended start</div>' if name == recommended else ""
    tl = f"""      <div class="tier reveal">
        {ribbon('Thought Leader')}
        <h3>Thought Leader</h3>
        <div class="price">$749<span> /mo</span></div>
        <div class="setup">No setup fee</div>
        <p class="blurb">A consistent founder voice on LinkedIn, from your real POV.</p>
        <ul>
          <li><span class="tick">&#10003;</span> Text posts in your voice</li>
          <li><span class="tick">&#10003;</span> Built from short inputs</li>
          <li><span class="tick">&#10003;</span> Unique POV, not AI filler</li>
          <li><span class="tick">&#10003;</span> Consistent weekly cadence</li>
          <li><span class="tick">&#10003;</span> Human-reviewed before posting</li>
        </ul>
        <a href="{LANDBOT}" class="btn btn-ghost">Start the motion</a>
      </div>"""
    ce = f"""      <div class="tier reveal">
        {ribbon('Content Engine')}
        <h3>Content Engine</h3>
        <div class="price">$2,949<span> /mo</span></div>
        <div class="setup">+ $1,500 one-time setup</div>
        <p class="blurb">Strategy, inputs and multi-format content, ready to amplify.</p>
        <ul>
          <li><span class="tick">&#10003;</span> Everything in Thought Leader</li>
          <li><span class="tick">&#10003;</span> Topic map by funnel stage</li>
          <li><span class="tick">&#10003;</span> Monthly interview sessions</li>
          <li><span class="tick">&#10003;</span> Text, image &amp; video assets</li>
          <li><span class="tick">&#10003;</span> Thought-leader ads + engagement intel</li>
          <li><span class="tick">&#10003;</span> Monthly analytics &amp; strategy sync</li>
        </ul>
        <a href="{LANDBOT}" class="btn btn-ghost">Run the engine</a>
      </div>"""
    be = f"""      <div class="tier featured reveal">
        <div class="ribbon">&starf; The full system</div>
        <h3>Brand Engine</h3>
        <div class="price">Beta Testing</div>
        <div class="setup">Talk to sales for a custom quote</div>
        <p class="blurb">The full brand brain, powering sharp assets across every channel, organic and paid.</p>
        <ul>
          <li><span class="tick">&#10003;</span> Everything in Content Engine</li>
          <li><span class="tick">&#10003;</span> We build &amp; maintain your Brand Engine</li>
          <li><span class="tick">&#10003;</span> Governed by your foundational documents</li>
          <li><span class="tick">&#10003;</span> 2-3 newsletters / month</li>
          <li><span class="tick">&#10003;</span> YouTube + 1-2 landing pages / month</li>
          <li><span class="tick">&#10003;</span> 1-2 blogs + ad copy on demand</li>
        </ul>
        <a href="{LANDBOT}" class="btn btn-canopy">Talk to sales</a>
      </div>"""

    addon_copy = {
        "Paid Amplification": ("$500-750 /mo + spend", "Boost your top organic. The bridge to full paid."),
        "Outreach Automation": ("$500-750 /mo", "Auto-connect to the people engaging with your content, via HeyReach."),
        "2nd Exec Profile": ("$500-750 /mo", "A second voice on the same infrastructure. Add a partner or practice lead."),
    }
    ap, atext = addon_copy[addon]
    addon_card = f"""        <div class="addon"><h4>{addon}</h4><div class="ap">{ap}</div><p>{atext}</p></div>"""

    system_card = ""
    if show_system:
        system_card = f"""      <div class="anchor-buy reveal">
        <div style="font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--canopy);margin-bottom:10px;">Buy the whole thing</div>
        <h3 style="font-size:1.15rem;margin-bottom:6px;">The System Build</h3>
        <div class="price">$15,000 <span>one-time</span></div>
        <p style="font-size:.94rem;margin-top:10px;">Own the voice extraction process, skill architecture, setup, documentation and training. Run it internally for any number of executives or partners.</p>
      </div>
"""

    if show_system:
        bottom = f"""    <div class="anchor-row">
{system_card}      <div class="reveal">
        <div style="font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);margin-bottom:14px;">Add-on</div>
        <div class="addons" style="grid-template-columns:1fr;">
{addon_card}
        </div>
      </div>
    </div>"""
    else:
        bottom = f"""    <div class="reveal" style="margin-top:20px;">
      <div style="font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);margin-bottom:14px;">Add-on</div>
      <div class="addons" style="grid-template-columns:1fr;max-width:420px;">
{addon_card}
      </div>
    </div>"""

    return f"""<!-- [A5] PRICING -->
<section class="band alt" id="pricing">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>Pricing</span>
      <h2>Organic proves it. <span class="mk">Paid amplifies it.</span></h2>
      <p>Start where your voice is, then climb when it's earning. The combo is where most teams end up, because organic tells you which message works before you pay to scale it.</p>
    </div>

    <div class="anchor-buy reveal" style="margin-bottom:20px;border:1px solid var(--accent);border-style:solid;background:linear-gradient(180deg,rgba(30,120,200,.12),var(--bg-2));">
      <div style="font-family:var(--font-mono);font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;">&starf; Organic + ads, together</div>
      <h3 style="font-size:1.2rem;margin-bottom:6px;">Thought Leadership + LinkedIn Ads</h3>
      <div class="price">$3,000 <span>/mo + ad spend</span></div>
      <p style="font-size:.94rem;margin-top:10px;max-width:74ch;">The combo. Test the messaging organically, amplify the winners as thought-leader ads, then harvest the signals the motion throws off, organic engagement, website visitors, and ad engagement, and flow them into email and LinkedIn connect and message plays. Full-funnel value out of every post.</p>
      <a href="{LANDBOT}" class="btn btn-primary" style="margin-top:16px;">Run the combo &rarr;</a>
    </div>

    <div class="price-grid">
{tl}
{ce}
{be}
    </div>
    <p class="pricing-note">Brand Engine output volumes are a representative monthly scope and flex to your priorities.</p>
{bottom}
  </div>
</section>"""

EDGE = """<!-- [A6] THE VISIBLE EDGE -->
<section class="band alt">
  <div class="wrap" style="max-width:900px">
    <div class="section-head reveal" style="text-align:left;margin:0">
      <span class="eyebrow"><span class="dot"></span>The visible edge</span>
      <h2>Most agencies rent a dashboard. <span class="text-accent">We run a deeper signal layer.</span></h2>
      <p style="max-width:74ch"><a href="https://demandsense.com/?utm_source=impactable&amp;utm_medium=referral&amp;utm_campaign=site" target="_blank" rel="noopener">DemandSense</a> composes five signal sources, from your CRM to your LinkedIn paid and organic engagement to the companies and people identified on your site, into one account-level view: who is engaging with your content, from what company, in what role, and how close they are to a decision. It's what turns authority into a named list your sales team can act on. No competitor connects these dots.</p>
    </div>
  </div>
</section>"""

PROOF = """<!-- [A7] PROOF -->
<section class="band" id="proof">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>The proof</span>
      <h2>Straight from the people who <span class="text-accent">worked with us.</span></h2>
    </div>
    <div class="proof-grid">
      <div class="quote reveal"><div class="mark">"</div><p>The only LinkedIn ads agency we recommend to our clients. You do that incredibly well.</p><div class="who">Jason Vana</div><div class="role">Founder, SHFT</div></div>
      <div class="quote reveal"><div class="mark">"</div><p>Everyone else had to beat what I'd already seen from them in organic content. I let the agency lead and I've been thrilled.</p><div class="who">Amy Appleton</div><div class="role">Growth Marketer</div></div>
      <div class="quote reveal"><div class="mark">"</div><p>You changed the LinkedIn ads game for so many businesses, as clients, or with the content you share for free.</p><div class="who">Moritz Kaiser</div><div class="role">Demand &amp; Copywriting</div></div>
    </div>
    <p class="reveal" style="margin-top:34px;text-align:center;font-size:1rem;color:var(--text-muted);max-width:80ch;margin-left:auto;margin-right:auto;"><strong style="color:var(--text)">Thought Leader of the Year</strong>, named by LinkedIn at the 2026 Indie Agency Awards &middot; <strong style="color:var(--text)">Certified LinkedIn Marketing Partner</strong>, first cohort &middot; On stage at LinkedIn's Independent Agency Summits, New York.</p>
  </div>
</section>"""

# Shared FAQ items (A8)
SHARED_FAQ = [
    ("What exactly is a \"brand brain\"?",
     "A governed knowledge base loaded with your voice, positioning, proof, frameworks and ICP, run by five foundational documents. It knows your brand better than anyone and produces sharp, on-brand assets across every channel, organic and paid."),
    ("How long until it's live?",
     "Typically 4 to 6 weeks across three phases: voice calibration, first batch, approve and launch. The timeline depends on your turnaround on the intake form, calibration feedback and Month 1 inputs."),
    ("How does this connect to our paid ads?",
     "Directly. We test messages organically, amplify the winners as thought-leader ads across LinkedIn, YouTube and Facebook, then harvest the signals: organic engagement, named website visitors and ad engagement. Those flow into email and LinkedIn connect and message plays that feed the whole funnel."),
]


def faq_section(extra):
    items = SHARED_FAQ + extra
    rows = "\n".join(
        f'      <details><summary>{q}<span class="pm">+</span></summary><p>{a}</p></details>'
        for q, a in items)
    return f"""<!-- FAQ -->
<section class="band alt" id="faq">
  <div class="wrap" style="max-width:860px;">
    <div class="section-head reveal" style="margin-bottom:24px;">
      <span class="eyebrow"><span class="dot"></span>FAQ</span>
      <h2>Questions, answered.</h2>
    </div>
    <div class="faq reveal">
{rows}
    </div>
  </div>
</section>""", items


def final_cta(headline_html):
    return f"""<!-- [A9] FINAL CTA -->
<section class="final" id="book">
  <div class="wrap">
    <p class="reveal" style="font-family:var(--font-mono);font-size:13px;letter-spacing:.04em;color:var(--text-faint);margin-bottom:14px;">The team behind Lacework's 6X, published by LinkedIn, and named LinkedIn's Thought Leader of the Year for 2026.</p>
    <h2 class="reveal">{headline_html}</h2>
    <div class="hero-cta reveal" style="justify-content:center;">
      {cta_pair()}
    </div>
  </div>
</section>"""


# ---- section builders for the per-page unique copy ---------------------------
def cards4(label, header_html, cards):
    lis = "\n".join(
        f'      <div class="pillar reveal"><h4>{t}</h4><p>{b}</p></div>' for t, b in cards)
    return f"""<section class="band alt">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>{label}</span>
      <h2>{header_html}</h2>
    </div>
    <div class="grid-4">
{lis}
    </div>
  </div>
</section>"""


def cards3(label, header_html, cards):
    lis = "\n".join(
        f'      <div class="pillar reveal"><h4>{t}</h4><p>{b}</p></div>' for t, b in cards)
    return f"""<section class="band">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>{label}</span>
      <h2>{header_html}</h2>
    </div>
    <div class="grid-3">
{lis}
    </div>
  </div>
</section>"""


def plist(label, header_html, items, alt=False, footer_html=""):
    lis = "\n".join(
        f'      <li><b>{t}</b><p>{b}</p></li>' for t, b in items)
    band = "band alt" if alt else "band"
    foot = f'\n    <div class="xrow reveal">{footer_html}</div>' if footer_html else ""
    return f"""<section class="{band}">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span>{label}</span>
      <h2>{header_html}</h2>
    </div>
    <ul class="p-list reveal">
{lis}
    </ul>{foot}
  </div>
</section>"""


def hero(eyebrow, h1_html, subhead, risk):
    return f"""<!-- HERO -->
<section class="hero" id="hero">
  <div class="wrap">
    <span class="eyebrow reveal"><span class="dot"></span>{eyebrow}</span>
    <h1 class="reveal">{h1_html}</h1>
    <p class="lead reveal">{subhead}</p>
    <div class="hero-cta reveal">
      {cta_pair()}
    </div>
    <p class="risk-line reveal">{risk}</p>
{STATBAR}
  </div>
</section>"""


def head(title, desc, slug, breadcrumb_name, faq_items):
    canon = f"https://impactable.marketing/thought-leadership/{slug}"
    faq_ld = [{"@type": "Question", "name": q,
               "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_items]
    graph = [
        {"@type": "WebPage", "@id": f"{canon}#webpage", "url": canon, "name": title,
         "description": desc, "isPartOf": {"@id": "https://impactable.marketing/#website"},
         "about": {"@id": "https://impactable.marketing/#org"}, "inLanguage": "en"},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://impactable.marketing/"},
            {"@type": "ListItem", "position": 2, "name": "Thought Leadership", "item": "https://impactable.marketing/thought-leadership"},
            {"@type": "ListItem", "position": 3, "name": breadcrumb_name, "item": canon}]},
        {"@type": "Service", "name": title, "serviceType": "B2B thought leadership content (brand brain)",
         "provider": {"@id": "https://impactable.marketing/#org"},
         "areaServed": ["United States", "United Kingdom", "Canada", "Australia"], "url": canon},
        {"@type": "FAQPage", "mainEntity": faq_ld},
    ]
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/chrome.css"><script src="/assets/js/main.js"></script>
<meta charset="UTF-8">
<link rel="icon" href="https://impactable.com/wp-content/uploads/2022/02/fav.png" type="image/png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>(function(){{try{{var t=localStorage.getItem('imp-theme');if(t){{document.documentElement.setAttribute('data-theme',t);}}}}catch(e){{}}}})();</script>
<title>{title}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/mona-sans@5.0.0/index.min.css">
{STYLE}
{EXTRA_STYLE}
<link rel="canonical" href="{canon}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Impactable">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{html.escape(desc, quote=True)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="https://impactable.marketing/img/linkedin-certified-social-square.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{html.escape(desc, quote=True)}">
<meta name="twitter:image" content="https://impactable.marketing/img/linkedin-certified-social-square.png">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MK45VGG" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
{NAV}"""


def build_page(cfg):
    faq_html, faq_items = faq_section(cfg["faq_extra"])
    parts = [
        head(cfg["title"], cfg["desc"], cfg["slug"], cfg["breadcrumb"], faq_items),
        hero(cfg["eyebrow"], cfg["h1"], cfg["subhead"], cfg["risk"]),
        cards4(*cfg["pain"]),
        cards3(*cfg["whitespace"]),
        cards4(*cfg["committee"]),
        plist(*cfg["voice"]),
        plist(*cfg["targeting"], alt=True, footer_html=cfg.get("targeting_links", "")),
        MIDCTA,
        ENGINE,
        maturity(cfg["stage_label"]),
        pricing(cfg["rec"], cfg["addon"], cfg["system"]),
        EDGE,
        PROOF,
        faq_html,
        final_cta(cfg["final_h"]),
        FOOTER,
        TAIL,
    ]
    out = "\n\n".join(parts)
    path = os.path.join(OUTDIR, cfg["slug"] + ".html")
    os.makedirs(OUTDIR, exist_ok=True)
    open(path, "w", encoding="utf-8").write(out)
    return path


# =============================================================================
# PER-PAGE CONFIG (final copy, verbatim from spec)
# =============================================================================
SAAS = {
    "slug": "saas-founders",
    "title": "Thought Leadership for SaaS Founders | Impactable",
    "desc": "Founder-led thought leadership for B2B SaaS. We turn your point of view into an engine that warms the whole buying committee, then amplify the winners with paid. The team behind HeyReach's 20X.",
    "breadcrumb": "SaaS Founders",
    "eyebrow": "LinkedIn Marketing Partner &middot; B2B SaaS",
    "h1": "Your category sounds identical. <span class=\"text-accent\">Your point of view is the difference.</span>",
    "subhead": "Every competitor claims the same three things, so the feature list stopped working. Founder-led thought leadership is how a SaaS company gets chosen before the demo, and we build it from your real expertise, then amplify the winners with paid.",
    "risk": "Free, back in 48 hours. No sales call to get it.",
    "pain": ("Sound familiar", "What actually stalls SaaS content.", [
        ("You're the only one who can explain the difference.", "The positioning lives in your head. Nobody on the team can write it the way you say it on a sales call, so the content comes out generic and the differentiation disappears."),
        ("You started posting, then the quarter happened.", "Product, fundraising, a churn fire. Founder-led content dies from inconsistency, not from bad ideas, and the audience you built goes cold."),
        ("Your category is a wall of feature parity.", "Everyone says all-in-one, everyone says AI-powered. When every competitor makes the same claim, the buyer stops reading claims and starts looking for a reason to trust someone."),
        ("The board wants pipeline, not impressions.", "You can't defend content spend with reach numbers. Without named accounts and pipeline, thought leadership looks like a cost centre at exactly the wrong moment."),
    ]),
    "whitespace": ("The white space", "Everyone in SaaS says the same three things. <span class=\"text-accent\">That's your opening.</span>", [
        ("The saturated lane.", "All-in-one. AI-powered. The only platform you need. It's a wall of feature parity, and it converts nobody because it differentiates nothing."),
        ("The open lane.", "One specific outcome only you can prove, said by the person who actually built the thing. Founder credibility is the one asset a competitor can't copy or outspend."),
        ("How we find yours.", "Before anything publishes, we map your competitors' live messaging and their ad creative, so your first pillar lands in the gap they're all ignoring rather than adding to the noise."),
    ]),
    "committee": ("The committee", "Seven people touch a SaaS deal. <span class=\"text-accent\">Content reaches the ones ads can't.</span>", [
        ("The demand-gen operator.", "Titles: Director or Sr Director of Demand Gen, Growth, Marketing Ops. Your champion, and the one actually engaging with content. They share your posts internally. Build the warm pool around them."),
        ("The VP or CMO.", "Economic buyer. They rarely click an ad but they read the founder they've heard of. Thought leadership is often the only channel that reaches them at all."),
        ("The RevOps or analytics lead.", "Technical validator. Credibility first, and they research quietly long before raising a hand. Proof content and frameworks land here, product pitches don't."),
        ("The security or procurement reviewer.", "Appears as deal size grows. They're checking whether you're a real company with real thinking. Consistent published expertise does that work before the call."),
    ]),
    "voice": ("What goes in", "Your sales calls <span class=\"mk\">already contain the content.</span>", [
        ("Founder interviews.", "Monthly sessions where we mine the way you actually explain the problem, the objection you answer twenty times a week, and the opinion you're slightly nervous to publish. That last one usually performs best."),
        ("Sales-call language.", "How your buyers describe the pain in their own words, lifted from recordings. It's the fastest route to copy that sounds like the market rather than like marketing."),
        ("Product and category POV.", "Where the category is going, what the incumbents get wrong, and the specific outcome your product proves. This becomes your pillar set."),
        ("Proof and frameworks.", "Customer outcomes, benchmark data, and the repeatable frameworks you already use in demos, turned into content assets that get reused across paid and web."),
    ]),
    "targeting": ("The play", "Warm first. Then the accounts LinkedIn can reach, <span class=\"text-accent\">then everyone else.</span>", [
        ("Start with your product signals.", "Trial users, PQLs, CRM lists, and the companies already on your site. These are the cheapest conversions you'll ever get, and thought-leader ads against a warm pool run in the $75-150 CPL range across the accounts we manage, against $300-600+ for cold native."),
        ("Then the committee, by name.", "We build the target list from real engagement signal, not an assumed ICP, and give each committee role its own message and offer."),
        ("Then amplify what already worked.", "Posts that earned organic engagement become thought-leader ads. You're never paying to scale a message the market hasn't already validated."),
        ("Then harvest.", "Organic engagers, named site visitors, and ad engagers all flow into email and LinkedIn connect plays. Multi-touch accounts convert to pipeline at 3x+ single-touch across the accounts we manage, so the stacking is the point."),
    ]),
    "targeting_links": '<a href="/marketing-ecosystem">See how the ecosystem fits together &rarr;</a><a href="/linkedin-ads-for-saas">LinkedIn Ads for SaaS &rarr;</a><a href="/pricing">See pricing &rarr;</a>',
    "stage_label": "Roughly: pre-seed and seed sit at Validate, Series A at Ramp, Series B at Reach, growth equity at Supply, late stage and PE-backed at Sustain. Your round tells us the budget. Your stage tells us the play.",
    "rec": "Content Engine", "addon": "Paid Amplification", "system": False,
    "faq_extra": [
        ("Does thought leadership actually drive SaaS pipeline, or just followers?",
         "It drives pipeline when it's wired to the rest of the system. We track which named accounts engage with your content through DemandSense, then hand the accounts stacking signals to sales. Followers are a side effect, not the metric."),
        ("I'm a founder with no time. What do you actually need from me?",
         "Roughly 30 to 60 minutes a month. A recorded interview session, and short inputs like voice memos or notes when a topic occurs to you. The engine does the rest, and every asset comes back for your review before it publishes."),
    ],
    "final_h": "Your expertise is the moat. <span class=\"text-accent\">Let's make it compound.</span>",
}

COACHING = {
    "slug": "coaching-training",
    "title": "Thought Leadership for Coaches &amp; Training Firms | Impactable",
    "desc": "Your expertise is the product. We turn it into a content engine that fills your pipeline without you posting daily, then amplify what works with paid. Built by LinkedIn's 2026 Thought Leader of the Year.",
    "breadcrumb": "Coaches &amp; Training Firms",
    "eyebrow": "LinkedIn Marketing Partner &middot; Coaching &amp; Training",
    "h1": "Your expertise is the product. <span class=\"text-accent\">Right now it only exists when you're in the room.</span>",
    "subhead": "Coaching and training firms live or die on perceived authority, and you're too busy delivering to build it. We capture your methodology once, then run it as an engine that earns trust while you work.",
    "risk": "Free, back in 48 hours. No sales call to get it.",
    "pain": ("Sound familiar", "What actually stalls a practice built on expertise.", [
        ("You're the product and the delivery team.", "Every hour you spend marketing is an hour you're not billing. So marketing happens in bursts between engagements, and the pipeline reflects it."),
        ("Feast, then famine.", "A referral wave fills the calendar, you stop marketing to deliver, and ninety days later the pipeline is empty. The cycle repeats because nothing runs while you're working."),
        ("Your content sounds like everyone else's.", "The feed is saturated with motivational posts and \"5 lessons I learned\" formats. Inspiration is free and infinite. A specific, teachable methodology is not, and that's what you actually have."),
        ("You're competing against free.", "Your buyer can find a thousand videos on your topic tonight. What they can't find is proof that your particular approach produces a particular result. That gap is the whole sale."),
    ]),
    "whitespace": ("The white space", "Inspiration is saturated. <span class=\"text-accent\">Methodology isn't.</span>", [
        ("The saturated lane.", "Transformation language, motivational posts, and testimonial-as-proof. Everyone in the category claims proven results and life-changing outcomes, which means none of it reads as evidence anymore."),
        ("The open lane.", "A named methodology, taught in public, with a specific measurable outcome attached. Show the mechanism and you stop competing with free content, because free content doesn't have your framework."),
        ("How we find yours.", "We map what the loudest voices in your niche are already saying, then build your pillars around the part of your approach nobody else can teach."),
    ]),
    "committee": ("The committee", "When you sell into companies, <span class=\"text-accent\">four people decide.</span>", [
        ("The L&amp;D or enablement lead.", "Titles: Head of L&amp;D, Director of Enablement, Talent Development. Your champion. They're actively hunting for programs and they consume content to build their shortlist before they ever enquire."),
        ("The HR or People leader.", "Owns the budget line for development. They need the business case, not the inspiration: what changes, how it's measured, what it costs to do nothing."),
        ("The executive sponsor.", "For leadership and executive coaching, this is often the CEO or a functional VP buying for their team, or for themselves. They buy the individual, which is exactly why founder-led content wins here."),
        ("The skeptic in the room.", "Someone always thinks training is a nice-to-have. Published, specific expertise is what turns you from a vendor into an expert they'd defend internally."),
    ]),
    "voice": ("What goes in", "You already teach this. <span class=\"mk\">We're just capturing it.</span>", [
        ("Your methodology, on record.", "Monthly interview sessions that extract the framework you teach, the sequence you walk clients through, and the objection you handle in every discovery call."),
        ("The moments from the room.", "The pattern you keep seeing across clients, the mistake almost everyone makes, the reframe that lands every time. This is the content nobody else can write."),
        ("Your buyers' actual language.", "Pulled from your discovery and sales calls, so the copy sounds like the problem they'd describe rather than the solution you'd pitch."),
        ("Outcomes and proof.", "What changed, measured however you measure it. Specific beats superlative every time in a category this crowded."),
    ]),
    "targeting": ("The play", "Your warmest audience is <span class=\"text-accent\">people you've already taught.</span>", [
        ("Start with everyone who's already met your thinking.", "Past cohort participants, workshop and webinar attendees, your newsletter list, community members, and your referral network. This is the cheapest pipeline you have, and it's usually sitting completely unworked."),
        ("Then the site and the engagers.", "The companies and people identified on your site, plus everyone engaging with your posts. Warm audiences convert in the $75-150 range across the accounts we manage, versus $300-600+ for cold."),
        ("Then amplify the winners.", "The post that earned real organic engagement becomes a thought-leader ad. Small budgets go a long way here because you're only paying to scale proven messages."),
        ("Then turn attention into conversations.", "Everyone who engages can be auto-connected on LinkedIn, so the engine produces conversations rather than just impressions. That's what Outreach Automation is for, and this is the pocket it fits best."),
    ]),
    "targeting_links": '<a href="/marketing-ecosystem">See how the ecosystem fits together &rarr;</a><a href="/pricing">See pricing &rarr;</a>',
    "stage_label": "Roughly: your first six figures sits at Validate, a repeatable cohort or retainer at Ramp, a second offer or market at Reach, a team delivering without you at Supply, and a category-known practice at Sustain.",
    "rec": "Thought Leader", "addon": "Outreach Automation", "system": False,
    "faq_extra": [
        ("I'm a solo practitioner. Is $749 a month realistic for me?",
         "That's exactly who the Thought Leader tier is built for. One voice, consistent weekly posting, no setup fee, from short inputs you can record between sessions. Most practices start here and climb only once it's producing."),
        ("Won't giving away my methodology stop people from hiring me?",
         "It's the opposite, and it's the oldest pattern in expertise businesses. Teaching the framework proves you have one. Buyers hire you because they now believe the mechanism works and they want you to run it, not because they were kept in the dark."),
    ],
    "final_h": "You already have the expertise. <span class=\"text-accent\">Let's make it work while you do.</span>",
}

CONSULTING = {
    "slug": "consulting",
    "title": "Thought Leadership for Consulting Firms | Impactable",
    "desc": "Partner-led thought leadership for consulting firms. We capture each partner's point of view, keep the firm's voice consistent, and amplify what works with paid.",
    "breadcrumb": "Consulting Firms",
    "eyebrow": "LinkedIn Marketing Partner &middot; Consulting",
    "h1": "Your growth runs on partner reputations. <span class=\"text-accent\">None of them have time to build one.</span>",
    "subhead": "In consulting, the expertise is the offer and the partner is the brand. We capture each partner's real point of view, keep the firm's voice consistent across all of them, and turn published thinking into pipeline.",
    "risk": "Free, back in 48 hours. No sales call to get it.",
    "pain": ("Sound familiar", "What actually stalls a consulting firm's marketing.", [
        ("Growth depends on partners who are fully billable.", "Business development competes directly with utilization. The partners best placed to build authority are the ones with the least time to do it, so nothing gets published."),
        ("Every partner sounds like a different firm.", "One posts frameworks, one posts industry news, two post nothing. There's no governed voice, so the firm's brand never compounds, and each partner starts from zero."),
        ("Your best thinking is trapped in client deliverables.", "The frameworks, the diagnostics, the analysis your team produces weekly. All of it sits in decks and proposals nobody outside the engagement will ever see."),
        ("You're indistinguishable on paper.", "Trusted advisor. Data-driven insights. Tailored solutions. Every firm's site says it, so the buyer falls back on referrals and brand names, which is precisely the game you're trying to change."),
    ]),
    "whitespace": ("The white space", "\"Trusted advisor\" is what everyone claims. <span class=\"text-accent\">A named point of view isn't.</span>", [
        ("The saturated lane.", "Trusted advisor, data-driven insights, tailored solutions, generic maturity frameworks. It's interchangeable, which pushes buyers back toward whoever they already know."),
        ("The open lane.", "A partner with a specific, slightly contrarian position on a specific problem. Firms win engagements on a point of view, not on a capability list, and a real position is the one thing a bigger firm can't replicate quickly."),
        ("How we find yours.", "We map how competing firms position and what the category already over-claims, then build each partner's pillars around the problems where your firm's answer is genuinely different."),
    ]),
    "committee": ("The committee", "Consulting buys are sponsored, vetted, <span class=\"text-accent\">and signed by different people.</span>", [
        ("The functional executive sponsor.", "Titles: VP or SVP of the affected function, COO, transformation lead. They own the problem and initiate the search. They read partner content to decide who understands their situation."),
        ("The economic buyer.", "Often the CFO or CEO on a material engagement. They need the business case and the cost of inaction, framed in numbers, not methodology."),
        ("The internal skeptic.", "Someone who thinks the work should be done in-house. Published expertise is what makes the outside perspective feel worth paying for."),
        ("Procurement and legal.", "Late-stage, but they're checking legitimacy. A firm whose partners publish consistently reads as established, which quietly removes friction."),
    ]),
    "voice": ("What goes in", "Multiple partners. One firm voice. <span class=\"mk\">Both, on purpose.</span>", [
        ("Partner interviews.", "Monthly sessions per partner, capturing the position each has earned from the work. Each partner gets their own Founder &amp; Expert Voice DNA document, so they sound like themselves, not like a house style."),
        ("The firm's positioning layer.", "A Brand Voice DNA document sits above the individual voices, so a new partner or a new practice publishes on-brand from day one without relitigating what the firm stands for."),
        ("Client-work language, generalized.", "The frameworks and diagnostics from real engagements, abstracted so they teach without exposing anything confidential. This is where consulting firms have the deepest unused content reserve."),
        ("Deal-room objections.", "What prospects push back on during pursuit, answered publicly, so the content does the work before the pitch."),
    ]),
    "targeting": ("The play", "Your alumni and past clients are <span class=\"text-accent\">the warmest list in professional services.</span>", [
        ("Start with the network you already have.", "Alumni, past clients, speaking and event audiences, referral sources, and each partner's personal connections. In consulting this pool is unusually valuable and almost always unworked at scale."),
        ("Then the accounts you're pursuing, by name.", "We build the target list from real signal and give each committee role its own message, so the whole buying group sees the firm's thinking, not just your champion."),
        ("Then amplify per partner.", "Posts that earn organic traction become thought-leader ads from that partner's profile, which outperforms company-page advertising because buyers trust people."),
        ("Then hand sales the warm ones.", "Named accounts engaging across content, site, and ads get surfaced with full context. Multi-touch accounts convert to pipeline at 3x+ single-touch across the accounts we manage."),
    ]),
    "targeting_links": '<a href="/marketing-ecosystem">See how the ecosystem fits together &rarr;</a><a href="/pricing">See pricing &rarr;</a>',
    "stage_label": "Roughly: a single practice lead sits at Validate, a repeatable service line at Ramp, multiple partners publishing at Reach, a firm-wide voice at Supply, and category authority at Sustain. PE-backed roll-ups usually enter at Reach.",
    "rec": "Content Engine", "addon": "2nd Exec Profile", "system": True,
    "faq_extra": [
        ("How do you handle multiple partners without the firm sounding fragmented?",
         "Two layers. A firm-level Brand Voice DNA document holds positioning and standards, and each partner gets their own Voice DNA document underneath it. Partners sound like themselves, the firm stays coherent, and new partners onboard without a reset. Each additional voice is the 2nd Exec Profile add-on."),
        ("Can we run this in-house instead?",
         "Yes, that's The System Build. You own the voice extraction process, the skill architecture, the documentation and the training, and run it internally across as many partners as you like. Firms with a real marketing function often prefer this."),
    ],
    "final_h": "Your partners' expertise is the firm's best asset. <span class=\"text-accent\">Let's publish it.</span>",
}

IT = {
    "slug": "it-services",
    "title": "Thought Leadership for IT Services &amp; MSPs | Impactable",
    "desc": "Thought leadership for IT services firms and MSPs. Break out of SLA sameness, stay in front of accounts locked to incumbents, and turn technical depth into pipeline.",
    "breadcrumb": "IT Services &amp; MSPs",
    "eyebrow": "LinkedIn Marketing Partner &middot; IT Services &amp; MSPs",
    "h1": "You're technically better than your competitors. <span class=\"text-accent\">On paper you look identical.</span>",
    "subhead": "Every IT services firm promises certified engineers, proactive monitoring and 24/7 support, so buyers default to price or to whoever they already use. Published technical expertise is how you stop being a line-item comparison.",
    "risk": "Free, back in 48 hours. No sales call to get it.",
    "pain": ("Sound familiar", "What actually stalls growth in IT services.", [
        ("You're being compared on price, not capability.", "When every proposal lists the same certifications and SLAs, procurement has nothing to judge but the number at the bottom. Depth you can't demonstrate publicly is depth that doesn't count."),
        ("Your best accounts are locked to an incumbent.", "They're not shopping, and they won't be for two or three years. Cold outreach into those accounts fails, but sustained visibility means you're the one they call when the contract finally cracks."),
        ("Your technical team can't write, and shouldn't have to.", "The real expertise sits with engineers and architects who have no interest in publishing. So it stays internal, and the marketing sounds like it was written by someone who's never touched the stack."),
        ("Growth depends on the owner's relationships.", "It works until it doesn't scale. There's no motion generating demand independently of who the founder happens to know."),
    ]),
    "whitespace": ("The white space", "Everyone claims the same SLA. <span class=\"text-accent\">Almost nobody publishes a real position.</span>", [
        ("The saturated lane.", "24/7 support, certified engineers, proactive monitoring, trusted partner. It's the entire category's homepage, and it gives a buyer no reason to prefer you."),
        ("The open lane.", "A specific operational outcome plus a genuine position on where IT is heading: cloud cost discipline, security posture, AI operations, consolidation. Buyers choose the firm that seems to know what's coming, not the one with the longest certification list."),
        ("How we find yours.", "We map what competing providers in your market claim and where the category over-promises, then build pillars around the problems your team actually solves better."),
    ]),
    "committee": ("The committee", "Nobody replaces an IT provider <span class=\"text-accent\">alone.</span>", [
        ("The CIO or IT director.", "Economic buyer and the one carrying the risk of a switch. They read to reduce that risk, which is exactly what consistent published thinking does."),
        ("The IT manager or infrastructure lead.", "Technical validator. They'll spot a marketing claim instantly and they'll respect real depth. Content written with actual engineering substance is what earns this person."),
        ("The CFO.", "Present on any material managed contract. They need the cost and risk case, not the tech stack."),
        ("Security and compliance.", "Increasingly in the path on every deal. Published expertise on posture and process is often the fastest way to get comfortable early."),
    ]),
    "voice": ("What goes in", "Your engineers have the expertise. <span class=\"mk\">We do the writing.</span>", [
        ("Technical interviews.", "Monthly sessions with your architects, engineers, and service leads. They talk, we write. Nobody on your technical team has to draft anything."),
        ("The ticket and incident patterns.", "The problems you keep resolving, the misconfigurations you keep finding, the decisions clients keep getting wrong. This is credible, specific, useful content, and it's already happening every day."),
        ("Owner and leadership POV.", "Where the market is going, what the consolidation wave means for buyers, and what you'd do differently. This is the layer that separates a provider from a vendor."),
        ("Buyer language from your sales calls.", "How prospects describe the pain of their current provider, in their words, which is far more persuasive than describing your capabilities."),
    ]),
    "targeting": ("The play", "Your install base first. <span class=\"text-accent\">Then the accounts you're waiting on.</span>", [
        ("Start with your existing client base.", "In IT services the expansion opportunity inside current accounts usually outweighs new logo pipeline, and your clients are the warmest audience you'll ever address. Additional service lines get sold here first."),
        ("Then the accounts locked to incumbents.", "These are a long game, and that's the point. Sustained authority keeps you present through a multi-year replacement cycle, so you're the obvious call when a contract fails or an outage forces a review. Cold outreach cannot do this. Consistent published expertise can."),
        ("Then the reachable market by name.", "We build the target list from real signal by geography, size and vertical, and route the accounts LinkedIn can't reach efficiently to programmatic, Facebook or email so nothing on the list goes dark."),
        ("Then amplify and harvest.", "Posts that land organically become thought-leader ads, and every engager, named site visitor and ad engager flows into email and LinkedIn plays. Warm audiences convert in the $75-150 range across the accounts we manage, versus $300-600+ cold."),
    ]),
    "targeting_links": '<a href="/programmatic">How we route the unreachable accounts &rarr;</a><a href="/marketing-ecosystem">See the ecosystem &rarr;</a><a href="/pricing">See pricing &rarr;</a>',
    "stage_label": "Roughly: owner-led selling sits at Validate, a repeatable service package at Ramp, a real marketing motion at Reach, multi-market or multi-vertical at Supply, and regional category authority at Sustain. PE-backed roll-ups usually enter at Reach.",
    "rec": "Content Engine", "addon": "2nd Exec Profile", "system": True,
    "faq_extra": [
        ("Our sales cycle is years, because accounts are locked into contracts. Is content worth it?",
         "That's the strongest argument for it. You can't outbound your way into an account that isn't shopping, but you can be the firm they've been reading for two years when the contract finally comes up. Content is the only channel that stays economical over a cycle that long."),
        ("Our engineers won't write, and I don't want marketing fluff. How does this work?",
         "Your team never writes. We interview them, then produce the assets and route everything back for a technical review pass before it publishes. Nothing goes out that your engineers haven't approved, which is what keeps it credible to the buyer's technical validator."),
    ],
    "final_h": "Your technical depth is the differentiator. <span class=\"text-accent\">Let's make it visible.</span>",
}

PAGES = [SAAS, COACHING, CONSULTING, IT]

if __name__ == "__main__":
    for cfg in PAGES:
        p = build_page(cfg)
        print("wrote", os.path.relpath(p, ROOT))
