import { useState } from "react";
import type { BeautyDetails, BeautyServiceItem, BeautyDurationRule, BeautyBreak } from "../../../../../types/BeautyDetails";
import "./MakeupSection.css";

interface Props { value?: BeautyDetails; maxCustomers: string; onMaxCustomersChange: (value: string) => void; onChange: (value: BeautyDetails) => void; }
const empty: BeautyDetails = { openingTime: "09:00", closingTime: "18:00", services: [], durationRules: [], breaks: [] };
const newId = () => `beauty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function MakeupSection({ value, maxCustomers, onMaxCustomersChange, onChange }: Props) {
  const details = value ?? empty;
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [minCount, setMinCount] = useState("1");
  const [maxCount, setMaxCount] = useState("1");
  const [minutes, setMinutes] = useState("15");
  const [breakStart, setBreakStart] = useState("13:00");
  const [breakEnd, setBreakEnd] = useState("14:00");
  const update = (patch: Partial<BeautyDetails>) => onChange({ ...details, ...patch });
  const addService = () => {
    if (!serviceName.trim() || !servicePrice || Number(servicePrice) < 0) return;
    const item: BeautyServiceItem = { id: newId(), name: serviceName.trim(), price: Number(servicePrice), active: true };
    update({ services: [...details.services, item] }); setServiceName(""); setServicePrice("");
  };
  const addRule = () => {
    const rule: BeautyDurationRule = { minServices: Number(minCount), maxServices: Number(maxCount), durationMinutes: Number(minutes) };
    if (rule.minServices < 1 || rule.maxServices < rule.minServices || rule.durationMinutes < 1) return;
    if (details.durationRules.some(r => rule.minServices <= r.maxServices && rule.maxServices >= r.minServices)) return;
    update({ durationRules: [...details.durationRules, rule].sort((a,b) => a.minServices-b.minServices) });
  };
  const addBreak = () => {
    if (breakStart >= breakEnd || details.breaks.some(b => breakStart < b.endTime && breakEnd > b.startTime)) return;
    const item: BeautyBreak = { startTime: breakStart, endTime: breakEnd, label: "Break" };
    update({ breaks: [...details.breaks, item].sort((a,b) => a.startTime.localeCompare(b.startTime)) });
  };
  return <section className="beauty-config-section">
    <h3>Beauty &amp; Makeup appointment setup</h3>
    <p>Configure the salon menu, appointment duration rules and shop hours. Maximum simultaneous customers is set in Booking Settings.</p>
    <div className="form-grid">
      <label>Shop opens<input type="time" value={details.openingTime} onChange={e=>update({openingTime:e.target.value})}/></label>
      <label>Shop closes<input type="time" value={details.closingTime} onChange={e=>update({closingTime:e.target.value})}/></label>
      <div className="beauty-fixed-interval"><strong>Appointment start times</strong><span>Customers can select a start time every 30 minutes, from opening time until closing time. Appointment duration is calculated separately from selected services or package.</span></div>
      <label>Maximum simultaneous customers<input type="number" min="1" value={maxCustomers} onChange={e=>onMaxCustomersChange(e.target.value)}/><small>Maximum overlapping appointments the salon can serve. This is customer capacity, not staff count.</small></label>
    </div>
    <h4>Individual services</h4>
    <div className="form-grid"><label>Service name<input value={serviceName} onChange={e=>setServiceName(e.target.value)} placeholder="e.g. Threading"/></label><label>Price (₹)<input type="number" min="0" value={servicePrice} onChange={e=>setServicePrice(e.target.value)} placeholder="Price"/></label></div>
    <button type="button" onClick={addService}>Add service</button>
    {details.services.map(item=><div key={item.id} className="beauty-row"><span>{item.name} · ₹{item.price}</span><label><input type="checkbox" checked={item.active} onChange={e=>update({services:details.services.map(s=>s.id===item.id?{...s,active:e.target.checked}:s)})}/> Active</label><button type="button" onClick={()=>update({services:details.services.filter(s=>s.id!==item.id)})}>Remove</button></div>)}
    <h4>Duration by number of selected services</h4>
    <p>Define non-overlapping service-count ranges. Every selectable count must have a matching rule.</p>
    <div className="form-grid"><label>From services<input type="number" min="1" value={minCount} onChange={e=>setMinCount(e.target.value)}/></label><label>To services<input type="number" min="1" value={maxCount} onChange={e=>setMaxCount(e.target.value)}/></label><label>Duration (minutes)<input type="number" min="1" value={minutes} onChange={e=>setMinutes(e.target.value)}/></label></div>
    <button type="button" onClick={addRule}>Add duration rule</button>
    {details.durationRules.map((rule,i)=><div className="beauty-row" key={`${rule.minServices}-${rule.maxServices}-${i}`}><span>{rule.minServices}–{rule.maxServices} services = {rule.durationMinutes} minutes</span><button type="button" onClick={()=>update({durationRules:details.durationRules.filter((_,index)=>index!==i)})}>Remove</button></div>)}
    <h4>Breaks / blocked times</h4>
    <div className="form-grid"><label>From<input type="time" value={breakStart} onChange={e=>setBreakStart(e.target.value)}/></label><label>To<input type="time" value={breakEnd} onChange={e=>setBreakEnd(e.target.value)}/></label></div>
    <button type="button" onClick={addBreak}>Add break</button>
    {details.breaks.map((item,i)=><div className="beauty-row" key={`${item.startTime}-${i}`}><span>{item.startTime}–{item.endTime}</span><button type="button" onClick={()=>update({breaks:details.breaks.filter((_,index)=>index!==i)})}>Remove</button></div>)}
  </section>;
}
