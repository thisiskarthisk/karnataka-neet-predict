'use client';

import Reveal from './reveal';

export default function TrustStats() {
  return (
    <section className="stats-band trust-stats" aria-label="Our track record">
      <div className="container-cc">
        <Reveal>
          <div className="stats-grid">
            <div className="stat">
              <b>50,000+</b>
              <span>Students Helped</span>
            </div>
            <div className="stat">
              <b>1,20,000+</b>
              <span>Predictions Generated</span>
            </div>
            <div className="stat">
              <b>15,000+</b>
              <span>Counselling Guidance Sessions</span>
            </div>
            <div className="stat">
              <b>8,000+</b>
              <span>Admission Success Stories</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}