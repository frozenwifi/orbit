"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { earningsByPeriod } from "@/data/dashboard";
import type { EarningsPeriod } from "@/types/dashboard";

const periods = Object.keys(earningsByPeriod) as EarningsPeriod[];

export function EarningsCard() {
  const [period, setPeriod] = useState<EarningsPeriod>("Monthly");

  return (
    <section className="card earnings-card card-lift" aria-labelledby="earningsTitle">
      <div className="card-header">
        <h2 className="card-title" id="earningsTitle">Earnings</h2>
        <Dropdown
          ariaLabel="Earnings period"
          menuClassName="control-menu period-menu"
          trigger={({ isOpen, toggle, buttonRef, contentId }) => (
            <button className="period-button" type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
              <span className="period-label">{period}</span>
              <span className="down-chevron" aria-hidden="true" />
            </button>
          )}
        >
          {(close) => periods.map((option) => (
            <button className={option === period ? "selected" : undefined} key={option} type="button" role="menuitemradio" aria-checked={option === period} onClick={() => {
              setPeriod(option);
              close();
            }}>{option}</button>
          ))}
        </Dropdown>
      </div>
      <div className="earnings-content">
        <div className="donut-wrap" aria-label={`Earnings balance ${earningsByPeriod[period]}`}>
          <div className="donut" aria-hidden="true" />
          <div className="donut-copy" key={period}><strong>{earningsByPeriod[period]}</strong><span>Balance</span></div>
          <span className="percentage-tag">20.93%</span>
        </div>
        <div className="earnings-legend">
          <span className="legend-dot" aria-hidden="true" /><strong>Fees</strong><span>$992.00</span>
          <span className="legend-dot income" aria-hidden="true" /><strong>Income</strong><span>$10,092</span>
        </div>
      </div>
    </section>
  );
}
