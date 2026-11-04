import React,{useEffect,useMemo,useRef,useState} from 'react';

const UX_CSS=`/* UX rescue additions. Prefixed with .room-app so they win over styles.css regardless of import order. */

/* Keyboard focus was invisible */
.room-app button:focus-visible,.room-app input:focus-visible,.room-app select:focus-visible,.room-app textarea:focus-visible{outline:3px solid #2f6fd6;outline-offset:2px}

/* Legibility: 9–10px grey-on-white text was below readable size and contrast */
.room-app .calendar-controls p,.room-app .helper,.room-app .calendar-note,.room-app .booking-description,.room-app .reservation-body small{color:#566b74;font-size:12px}
.room-app .calendar-controls label,.room-app .legend,.room-app .calendar-controls select{font-size:11.5px;color:#43606b}
.room-app .reservation-body strong{font-size:12.5px}
.room-app .room-chip{font-size:11.5px}
.room-app .roomname small{color:#6d8089;font-size:10.5px}

/* Issue 2: calendar states (Open / Reserved / Yours / Selected / Conflict) */
.room-app .legend .mine-sw{background:#0f7b86}
.room-app .legend .edit-sw{background:#bcd9ff;box-shadow:inset 0 0 0 2px #1e6fd9}
.room-app .legend .sel-sw{background:#1f4e8c;box-shadow:inset 0 0 0 2px #0f2f5c}
.room-app .slot span{font-size:11.5px}
.room-app .slot small{font-size:10.5px;color:inherit;opacity:.9}
.room-app .slot.taken{background:#d9e7ed;color:#3f5f6e;cursor:not-allowed}
.room-app .slot.taken:hover{outline:none}
.room-app .slot.mine{background:#0f7b86;color:#fff;box-shadow:inset 0 0 0 2px #0a5a63}
.room-app .slot.editing{background:#bcd9ff;color:#0b2f66;font-weight:700;box-shadow:inset 0 0 0 3px #1e6fd9}
.room-app .slot.selected{background:#1f4e8c;color:#fff;box-shadow:inset 0 0 0 2px #0f2f5c}
.room-app .slot.clash{background:#fde7e5;color:#9a3636;box-shadow:inset 0 0 0 2px #d86a6a}

/* Issue 2: selection summary above the calendar (also the mobile bridge to the form) */
.room-app .selbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin-bottom:14px;border-radius:9px;font-size:12px}
.room-app .selbar>span{margin-right:auto}
.room-app .selbar.good{background:#e6f8ea;border:1px solid #bfe6cc;color:#1f6a4a}
.room-app .selbar.bad{background:#fff1f0;border:1px solid #f0c4c0;color:#9a3636}
.room-app .selbar button{border:1px solid currentColor;background:#fff;color:inherit;border-radius:6px;padding:7px 11px;font-size:11.5px;font-weight:600}
.room-app .selbar button.ghost{border-color:transparent;background:transparent;text-decoration:underline}

/* Issue 1: live availability / error panel */
.room-app .status{padding:12px 13px;border-radius:8px;margin:0 0 16px;font-size:12px;line-height:1.5}
.room-app .status strong,.room-app .status span{display:block}
.room-app .status.good{background:#e6f8ea;color:#1f6a4a;border:1px solid #bfe6cc}
.room-app .status.bad{background:#fff1f0;color:#9a3636;border:1px solid #f0c4c0}
.room-app .status.hint{background:#f4f8f8;color:#566b74;border:1px solid #e4eef0}
.room-app .status ul{margin:8px 0 0;padding-left:18px}
.room-app .alts{display:grid;gap:10px;margin-top:12px}
.room-app .alts>div>span{font-size:11px;font-weight:600;margin-bottom:6px;color:#6b3a3a}
.room-app .chips{display:flex;flex-wrap:wrap;gap:6px}
.room-app .alts button{border:1px solid #c8d9de;background:#fff;color:#0f6b75;border-radius:6px;padding:6px 10px;font-size:11.5px;font-weight:600}
.room-app .booking-pane input.invalid{border-color:#d86a6a;background:#fff8f7}

/* Issue 3: edit mode, delete confirmation, row highlight, sticky form */
.room-app .editing-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#eaf6f7;border:1px solid #9fd0d4;border-left:4px solid #0f7b86;border-radius:8px;padding:11px 12px;margin:0 0 16px;font-size:12px}
.room-app .editing-banner small,.room-app .editing-banner strong{display:block}
.room-app .editing-banner small{color:#3f6a72;font-size:11px;margin-bottom:3px}
.room-app .editing-banner button{border-radius:6px;padding:7px 11px;font-size:11.5px;font-weight:600;border:1px solid transparent;background:transparent}
.room-app .danger-link{color:#a23b3b;text-decoration:underline}
.room-app .confirm{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.room-app .confirm .danger{background:#b83c3c;color:#fff}
.room-app .confirm .ghost{border-color:#9fd0d4;background:#fff;color:#2c5b63}
.room-app .reservation.is-editing{border-color:#0f7b86;background:#eaf6f7}
.room-app .cancel-edit{color:#2c5b63;text-decoration:underline;display:block;margin:10px auto 0}
@media(max-width:700px){.room-app .selbar{font-size:11.5px}}

/* Calendar: no hover-dependent behaviour; every action is stated in visible text and works on tap and click */
.room-app .slot:hover{outline:none}
.room-app .slot.available small{color:#1f6a4a;font-weight:600}
.room-app .calendar-help{margin:0 0 14px;padding:10px 12px;background:#f4f8f8;border-radius:8px;font-size:12.5px;color:#2f4f5a}

/* Separate pages */
.room-app .topbar nav button{font-size:13px;padding:14px 6px}
.room-app .page-notice{margin:0 0 20px;font-size:12.5px}
.room-app .booking-page{max-width:680px;margin:0 auto}
.room-app .back-link,.room-app .link-btn{border:0;background:transparent;color:#0f6b75;text-decoration:underline;font-size:12.5px;padding:6px 0}
.room-app .back-link{margin-bottom:12px}
.room-app .link-btn{display:block;margin:0 0 14px}
.room-app .booking-pane h2:focus{outline:none}
.room-app .mybookings-page{background:#fff;border:1px solid #dce7ec;border-radius:13px;padding:24px}
.room-app .page-head{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.room-app .page-head h1{font:700 32px 'Space Grotesk';letter-spacing:-.03em;margin:8px 0}
.room-app .page-head p{font-size:13px;color:#566b74;margin:0}
.room-app .new-booking{background:#0f7b86;color:#fff;border:0;border-radius:7px;padding:12px 18px;font-weight:700;font-size:13px}
.room-app .mybookings-page .reservations{margin-top:22px}
.room-app .reservation button{font-size:12.5px;padding:8px 6px}
@media(max-width:700px){.room-app .reservations-list{grid-template-columns:1fr}.room-app .mybookings-page{padding:14px}}

/* Flat layout: no cards. Borders are kept only where content is compared (the availability grid) or to separate list rows. */
.room-app{background:#fff;min-height:100vh}
.room-app .calendar-pane,.room-app .booking-pane,.room-app .mybookings-page,.room-app .intro-summary{background:transparent;border:0;border-radius:0;box-shadow:none;padding:0}
.room-app .intro-summary{padding:0;gap:4px 14px}
.room-app .calendar-head{padding-bottom:14px;border-bottom:1px solid #dce7ec}
.room-app .calendar-controls{background:transparent;border:0;padding:0;margin:0 0 12px}
.room-app .calendar-help{background:transparent;padding:0}
.room-app .right-foot{background:transparent;border-top:1px solid #e4ecef;border-radius:0;padding:14px 0 0}
.room-app .reservations{border-top:0;padding-top:0}
.room-app .reservations-list{grid-template-columns:1fr;gap:0}
.room-app .reservation{background:transparent;border:0;border-bottom:1px solid #e4ecef;border-radius:0;padding:14px 0}
.room-app .reservation.is-editing{background:transparent}
.room-app .room-chip{background:transparent;padding:0;min-width:64px;font-size:14px;font-weight:700;color:#135f69}


/* Compact schedule: all 18 rooms and 7 days fit the screen without scrolling */
.room-app .room-cal{--rh:clamp(26px,calc((100vh - 300px)/19),44px);min-width:0;grid-template-columns:76px repeat(7,minmax(0,1fr))}
.room-app .calendar-scroll{overflow:hidden}
.room-app .slot{min-height:0;height:var(--rh);padding:0 2px;gap:0}
.room-app .slot small{display:none}
.room-app .slot span{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.room-app .roomname{height:var(--rh);padding:0 8px;display:flex;align-items:center}
.room-app .roomname small{display:none}
.room-app .roomname strong{font-size:12px}
.room-app .dayhead{padding:5px 2px}
.room-app .dayhead span{margin-top:2px}
.room-app .corner{font-size:9.5px}
.room-app main{padding-top:14px;padding-bottom:16px}
.room-app .intro{margin-bottom:10px}
.room-app .intro .eyebrow,.room-app .intro p,.room-app .calendar-head .eyebrow{display:none}
.room-app .intro h1{font-size:24px;margin:0}
.room-app .intro-summary{grid-template-columns:repeat(4,auto);padding:0}
.room-app .calendar-head{margin-bottom:8px;padding-bottom:8px}
.room-app .calendar-head h2{font-size:17px;margin:0}
.room-app .calendar-controls{margin-bottom:6px}
.room-app .calendar-help{margin:0 0 8px}
.room-app .calendar-note{padding:8px 0 0}
.room-app footer{padding:12px}
@media(min-width:701px){.room-app .topbar{height:56px}}
@media(max-width:700px){.room-app .room-cal{grid-template-columns:54px repeat(7,minmax(0,1fr));--rh:clamp(26px,calc((100vh - 360px)/19),40px)}.room-app .slot span{font-size:9.5px}.room-app .roomname{padding:0 4px}.room-app .roomname strong{font-size:10.5px}.room-app .intro-summary{margin-top:8px}}

/* Feedback messages: a coloured rule instead of a filled box */
.room-app .status,.room-app .selbar,.room-app .editing-banner,.room-app .success{background:transparent;border:0;border-left:4px solid;border-radius:0;padding:4px 0 4px 12px}
.room-app .status.good,.room-app .selbar.good,.room-app .success{border-left-color:#2f9e6b;color:#1f6a4a}
.room-app .status.bad,.room-app .selbar.bad{border-left-color:#d86a6a;color:#9a3636}
.room-app .status.hint{border-left-color:#c3d3d8;color:#566b74}
.room-app .editing-banner{border-left-color:#1e6fd9}
.room-app .selbar button{background:transparent}
.room-app .alts button{background:transparent}

/* My bookings: order by room or date, optional day filter */
.room-app .list-tools{display:flex;flex-wrap:wrap;align-items:center;gap:12px 22px;margin:0 0 6px;padding-bottom:12px;border-bottom:1px solid #e4ecef}
.room-app .seg,.room-app .dayfilter{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#43606b}
.room-app .seg button{border:1px solid #c8d9de;background:transparent;color:#0f6b75;border-radius:6px;padding:6px 12px;font-size:12.5px;font-weight:600}
.room-app .seg button.on{background:#1f4e8c;border-color:#1f4e8c;color:#fff}
.room-app .dayfilter input{padding:6px 8px;border:1px solid #c8d9de;border-radius:6px;font-size:12.5px;color:#35606c}
.room-app .list-tools .link-btn{display:inline;margin:0}
.room-app .dayfilter select{padding:6px 8px;border:1px solid #c8d9de;border-radius:6px;font-size:12.5px;color:#35606c;background:#fff}

/* My bookings: denser layout, less empty space */
.room-app .mybookings-page .page-head h1{font-size:24px;margin:2px 0}
.room-app .mybookings-page .page-head p{font-size:12.5px}
.room-app .mybookings-page .eyebrow{display:none}
.room-app .mybookings-page .reservations{margin-top:12px}
.room-app .mybookings-page .reservations-head{margin-bottom:8px}
.room-app .mybookings-page .reservations-head h2{display:none}
.room-app .mybookings-page .reservations-head span{font-size:12.5px;color:#566b74}
.room-app .mybookings-page .list-tools{margin-bottom:0;padding-bottom:10px}
.room-app .mybookings-page .reservation{padding:9px 0;gap:12px}
.room-app .mybookings-page .room-chip{font-size:13px;min-width:58px}
.room-app .new-booking{padding:9px 16px}
@media(min-width:900px){.room-app .mybookings-page .reservations-list{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:44px}}


/* Book a room + your bookings side by side; form buttons in one row */
.room-app .booking-page{max-width:1240px}
.room-app .booking-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:48px;align-items:start}
.room-app .booking-layout .mybookings-page .reservations-list{grid-template-columns:1fr}
.room-app .mybookings-page .page-head h2{font:700 22px 'Space Grotesk';letter-spacing:-.02em;margin:0 0 4px}
.room-app .mybookings-page .page-head p{margin:0}
.room-app .reservation.is-editing{background:#f1f7ff;box-shadow:inset 4px 0 0 #1e6fd9;padding-left:12px}
.room-app .form-actions{display:flex;gap:10px;align-items:stretch}
.room-app .form-actions button{flex:1 1 0;width:auto;margin:0;padding:12px 8px;font-size:12px;white-space:nowrap}
.room-app .cancel-edit{border:1px solid #c8d9de;background:#fff;color:#2c5b63;text-decoration:none;border-radius:7px;font-weight:700}
@media(max-width:900px){.room-app .booking-layout{grid-template-columns:1fr;gap:32px}}
@media(max-width:480px){.room-app .form-actions{flex-wrap:wrap}.room-app .form-actions button{flex:1 1 40%}}
`;
const STORAGE='acl-roomgrid-18rooms-v1';
const BASE='2026-11-09';
const rooms=['A1-203', 'A2-106', 'A2-107', 'A3-208', 'A3-209', 'B1-205', 'B1-206', 'B1-207', 'B2-104', 'B2-105', 'B3-301', 'C1-102', 'C1-103', 'C2-201', 'C2-202', 'C3-101', 'C3-102', 'D1-101'];
// Storage model is unchanged: end dates are exclusive. The form now shows an inclusive "last day"
// and converts to/from the stored exclusive end date.
const sampleRows=[
 ['A1-203','2026-11-09','2026-11-11','Peer tutoring','other'],
 ['A1-203','2026-11-13','2026-11-15','Architecture workshop','other'],
 ['A1-203','2026-11-17','2026-11-19','Group assignment','you'],
 ['A2-106','2026-11-10','2026-11-13','Seminar preparation','other'],
 ['A2-106','2026-11-16','2026-11-19','Study circle','other'],
 ['A2-107','2026-11-09','2026-11-10','Student club planning','you'],
 ['A2-107','2026-11-12','2026-11-15','Project demo rehearsal','other'],
 ['A2-107','2026-11-16','2026-11-19','Study meeting','other'],
 ['A3-208','2026-11-11','2026-11-14','Presentation practice','other'],
 ['A3-208','2026-11-16','2026-11-18','Tutorial group','other'],
 ['A3-209','2026-11-10','2026-11-12','Study session','other'],
 ['B1-205','2026-11-09','2026-11-11','Meeting','other'],
 ['B1-205','2026-11-13','2026-11-15','Team discussion','other'],
 ['B1-205','2026-11-16','2026-11-18','Course project','other'],
 ['B1-206','2026-11-11','2026-11-13','Exam revision','other'],
 ['B1-206','2026-11-17','2026-11-20','Debate practice','you'],
 ['B1-207','2026-11-10','2026-11-12','Group study','you'],
 ['B1-207','2026-11-16','2026-11-19','Engineering project','other'],
 ['B2-104','2026-11-09','2026-11-11','Weekly study group','you'],
 ['B2-104','2026-11-13','2026-11-15','Team planning','other'],
 ['B2-104','2026-11-17','2026-11-19','Workshop preparation','other'],
 ['B2-105','2026-11-12','2026-11-15','Club meeting','other'],
 ['B2-105','2026-11-16','2026-11-18','Student committee','other'],
 ['B3-301','2026-11-09','2026-11-10','Debate practice','other'],
 ['B3-301','2026-11-11','2026-11-13','Group preparation','other'],
 ['B3-301','2026-11-18','2026-11-20','Portfolio review','other'],
 ['C1-102','2026-11-10','2026-11-14','Capstone meeting','other'],
 ['C1-102','2026-11-16','2026-11-19','Revision session','other'],
 ['C1-103','2026-11-09','2026-11-12','Group project','other'],
 ['C1-103','2026-11-14','2026-11-16','Student society','you'],
 ['C2-201','2026-11-12','2026-11-15','Project sprint','other'],
 ['C2-201','2026-11-16','2026-11-19','Robotics club','other'],
 ['C2-202','2026-11-09','2026-11-11','Lab preparation','other'],
 ['C2-202','2026-11-18','2026-11-20','Teaching assistant session','other'],
 ['C3-101','2026-11-12','2026-11-14','Presentation rehearsal','you'],
 ['C3-101','2026-11-14','2026-11-16','Design workshop','other'],
 ['C3-101','2026-11-18','2026-11-20','Study group','other'],
 ['C3-102','2026-11-11','2026-11-15','Research meeting','other'],
 ['D1-101','2026-11-10','2026-11-13','Team check-in','other'],
 ['D1-101','2026-11-16','2026-11-18','Group assignment','you'],
];
const seed=sampleRows.map(([roomNumber,startDate,endDate,purpose,owner],index)=>({id:`demo-${index+1}`,roomNumber,startDate,endDate,purpose,owner}));
const formEmpty={roomNumber:'',startDate:'',endDate:'',purpose:''};

function read(){try{let a=JSON.parse(localStorage.getItem(STORAGE));return Array.isArray(a)?a:seed;}catch{return seed;}}
const isoOk=s=>/^\d{4}-\d{2}-\d{2}$/.test(s);
const same=(a,b)=>a.toLowerCase()===b.toLowerCase();
function addDays(iso,days){const t=new Date(`${iso}T12:00:00Z`);t.setUTCDate(t.getUTCDate()+days);return t.toISOString().slice(0,10);}
function human(iso){return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'short'});}
function weekDay(iso){return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'short'});}
function dayCount(a,b){return Math.round((Date.parse(`${b}T12:00:00Z`)-Date.parse(`${a}T12:00:00Z`))/864e5);}
function weekOf(iso){const d=dayCount(BASE,iso);return addDays(BASE,Math.floor(d/7)*7);}
// start and exclusive end -> "17 Nov – 18 Nov · 2 days" (last day shown inclusively)
function rangeLabel(start,endEx){const n=dayCount(start,endEx);return (n===1?human(start):`${human(start)} – ${human(addDays(endEx,-1))}`)+` · ${n} ${n===1?'day':'days'}`;}

// Single source of truth for validation + live availability feedback.
function analyse(form,bookings,id){
 const typed=form.roomNumber.trim();
 if(!typed&&!form.startDate&&!form.endDate)return {kind:'empty'};
 if(!typed||!isoOk(form.startDate)||!isoOk(form.endDate))return {kind:'incomplete'};
 const room=rooms.find(r=>same(r,typed));
 if(!room)return {kind:'unknown'};
 if(form.endDate<form.startDate)return {kind:'order',room};
 const endEx=addDays(form.endDate,1);
 const clashes=(r,s,e)=>bookings.filter(b=>b.id!==id&&same(b.roomNumber,r)&&s<b.endDate&&e>b.startDate);
 const conflicts=clashes(room,form.startDate,endEx).sort((a,b)=>a.startDate.localeCompare(b.startDate));
 if(!conflicts.length)return {kind:'ok',room,endEx};
 const len=dayCount(form.startDate,endEx);
 let next=null;
 for(let i=1;i<=90&&!next;i++){const s=addDays(form.startDate,i);if(!clashes(room,s,addDays(s,len)).length)next=s;}
 const others=rooms.filter(r=>r!==room&&!clashes(r,form.startDate,endEx).length).sort((a,b)=>(b[0]===room[0])-(a[0]===room[0]));
 return {kind:'conflict',room,endEx,conflicts,next,len,others};
}

export default function App(){
 const [bookings,setBookings]=useState(read);
 const [week,setWeek]=useState(BASE);
 const [view,setView]=useState('All rooms');
 const [form,setForm]=useState({...formEmpty});
 const [editing,setEditing]=useState(null);
 const [anchor,setAnchor]=useState(null);          // first click of a two-click range selection
 const [attempted,setAttempted]=useState(false);   // user pressed Check / Confirm
 const [confirmDelete,setConfirmDelete]=useState(false);
 const [notice,setNotice]=useState('');
 const [sortBy,setSortBy]=useState('room');   // My bookings order: 'room' or 'date'
 const [dayFilter,setDayFilter]=useState(''); // My bookings: only show bookings covering this day
 const [building,setBuilding]=useState('All'); // My bookings: building letter of the room (A, B, C, D)
 const [tab,setTab]=useState('Availability');
 const headingRef=useRef(null);
 const roomRef=useRef(null);
 useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(bookings));}catch{/* storage unavailable: keep working in memory */}},[bookings]);
 useEffect(()=>{window.scrollTo(0,0);if(tab==='Book a room')setTimeout(()=>headingRef.current?.focus({preventScroll:true}),0);},[tab]);
 function go(t,keep){if(!keep)setNotice('');setTab(t);}
 const days=useMemo(()=>Array.from({length:7},(_,i)=>addDays(week,i)),[week]);
 const myBookings=bookings.filter(b=>b.owner==='you');
 const byRoom=(a,b)=>a.roomNumber.localeCompare(b.roomNumber,undefined,{numeric:true})||a.startDate.localeCompare(b.startDate);
 const byDate=(a,b)=>a.startDate.localeCompare(b.startDate)||a.roomNumber.localeCompare(b.roomNumber,undefined,{numeric:true});
 const buildings=[...new Set(rooms.map(r=>r[0]))];
 const filtered=isoOk(dayFilter)||building!=='All';
 const shownBookings=myBookings.filter(b=>!isoOk(dayFilter)||(dayFilter>=b.startDate&&dayFilter<b.endDate)).filter(b=>building==='All'||b.roomNumber[0].toUpperCase()===building).sort(sortBy==='room'?byRoom:byDate);
 const clearFilters=()=>{setDayFilter('');setBuilding('All');};
 const roomList=view==='All rooms'?rooms:rooms.filter(r=>r===view);
 const status=useMemo(()=>analyse(form,bookings,editing),[form,bookings,editing]);
 const editingRow=bookings.find(b=>b.id===editing);
 const occupied=(room,date)=>bookings.find(b=>same(b.roomNumber,room)&&date>=b.startDate&&date<b.endDate);
 const hasSelection=status.kind==='ok'||status.kind==='conflict';
 const rangeText=hasSelection?rangeLabel(form.startDate,status.endEx):'';

 function clearForm(){setForm({...formEmpty});setEditing(null);setAnchor(null);setAttempted(false);setConfirmDelete(false);}

 // Calendar click: first click sets the start, a second click on the same room sets the last day.
 function pick(room,date){
  setNotice('');setAttempted(false);setConfirmDelete(false);
  if(anchor&&same(anchor.room,room)&&date>=anchor.date){setForm(f=>({...f,roomNumber:room,startDate:anchor.date,endDate:date}));setAnchor(null);}
  else{setForm(f=>({...f,roomNumber:room,startDate:date,endDate:date}));setAnchor({room,date});}
 }
 function edit(row){
  if(row.owner!=='you')return;
  setEditing(row.id);setAnchor(null);setAttempted(false);setConfirmDelete(false);setNotice('');
  setForm({roomNumber:row.roomNumber,startDate:row.startDate,endDate:addDays(row.endDate,-1),purpose:row.purpose});
  setWeek(weekOf(row.startDate));
  go('Book a room',true);
  window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>headingRef.current?.focus({preventScroll:true}),0);
 }
 function applySlot(start,len){setAnchor(null);setForm(f=>({...f,startDate:start,endDate:addDays(start,len-1)}));setWeek(weekOf(start));}
 function applyRoom(r){setAnchor(null);setForm(f=>({...f,roomNumber:r}));}
 function setStart(v){setAnchor(null);setForm(f=>({...f,startDate:v,endDate:(!f.endDate||f.endDate<v)?v:f.endDate}));if(isoOk(v))setWeek(weekOf(v));}
 function setEnd(v){setAnchor(null);setForm(f=>({...f,endDate:v}));}

 function submit(e){
  e.preventDefault();setNotice('');setAttempted(true);
  if(status.kind!=='ok')return;           // the status panel explains exactly why
  const payload={roomNumber:status.room,startDate:form.startDate,endDate:status.endEx,purpose:form.purpose.trim(),owner:'you'};
  const text=`${payload.roomNumber} · ${rangeLabel(payload.startDate,payload.endDate)}`;
  if(editing){setBookings(bookings.map(b=>b.id===editing?{...b,...payload}:b));setNotice(`Booking updated. ${text}`);}
  else{setBookings([...bookings,{...payload,id:'b-'+Date.now()}]);setNotice(`Room reserved. ${text}`);}
  setWeek(weekOf(payload.startDate));clearForm();window.scrollTo({top:0,behavior:'smooth'});
 }
 function removeBooking(){
  if(!editingRow)return;
  setBookings(bookings.filter(b=>b.id!==editing));
  setNotice(`Booking deleted. ${editingRow.roomNumber} · ${rangeLabel(editingRow.startDate,editingRow.endDate)} is open again.`);
  clearForm();window.scrollTo({top:0,behavior:'smooth'});
 }
 function reset(){setBookings(seed);clearForm();setWeek(BASE);setNotice('Example bookings restored.');setView('All rooms');setTab('Availability');}
 function check(){setNotice('');setAttempted(true);}

 const invalid={
  roomNumber:status.kind==='unknown'||(attempted&&!form.roomNumber.trim()),
  startDate:(attempted&&!isoOk(form.startDate))||status.kind==='conflict',
  endDate:(attempted&&!isoOk(form.endDate))||status.kind==='order'||status.kind==='conflict',
 };

 function renderStatus(){
  const s=status;
  if(s.kind==='empty'||(s.kind==='incomplete'&&!attempted))return <div className="status hint" role="status">Pick a room and dates, or click an Open day in the calendar. Availability is checked as you type.</div>;
  if(s.kind==='incomplete')return <div className="status bad" role="alert">Complete the room and both dates.</div>;
  if(s.kind==='unknown')return <div className="status bad" role="alert">Room not found. Choose a room from the list, for example B2-104.</div>;
  if(s.kind==='order')return <div className="status bad" role="alert">The end date cannot be before the start date.</div>;
  if(s.kind==='ok')return <div className="status good" role="status"><strong>✓ {s.room} is free</strong><span>{rangeText}</span></div>;
  return <div className="status bad" role={attempted?'alert':'status'}>
   <strong>✗ {s.room} is already booked on some of these dates</strong>
   <ul>{s.conflicts.map(c=><li key={c.id}>{rangeLabel(c.startDate,c.endDate)} — {c.owner==='you'?'your booking':'reserved by someone else'}</li>)}</ul>
   <div className="alts">
    {s.next&&<div><span>Next free slot of the same length in {s.room}</span><button type="button" onClick={()=>applySlot(s.next,s.len)}>{rangeLabel(s.next,addDays(s.next,s.len))}</button></div>}
    {s.others.length>0&&<div><span>Free on your dates in another room</span><div className="chips">{s.others.slice(0,6).map(r=><button type="button" key={r} onClick={()=>applyRoom(r)}>{r}</button>)}</div></div>}
    {!s.next&&s.others.length===0&&<div><span>No alternative found. Try different dates.</span></div>}
   </div>
  </div>;
 }

 return <div className="room-app"><style>{UX_CSS}</style><header className="topbar"><div className="mark"><span className="mark-sq">R</span><span><strong>room<span>grid</span></strong><small>Campus spaces</small></span></div><nav>{['Availability','Book a room'].map(t=><button key={t} type="button" className={tab===t?'selected':''} aria-current={tab===t?'page':undefined} onClick={()=>go(t)}>{t}</button>)}<button type="button" onClick={reset}>Reset demo</button></nav><div className="member"><span>Student dashboard</span><div className="profile">YOU</div></div></header>
  <main>
   {notice&&<div className="success page-notice" role="status">{notice}</div>}

   {tab==='Availability'&&<>
    <section className="intro"><div><span className="eyebrow">SPACES / RESERVATIONS</span><h1>Find room availability</h1><p>Review campus rooms, dates and existing reservations in one view.</p></div><div className="intro-summary"><span>ROOMS IN DIRECTORY</span><strong>{rooms.length.toString().padStart(2,'0')}</strong><span>CURRENT RESERVATIONS</span><strong>{bookings.length.toString().padStart(2,'0')}</strong></div></section>
    <section className="calendar-pane"><div className="calendar-head"><div className="weeknav"><button aria-label="Previous week" onClick={()=>setWeek(addDays(week,-7))}>←</button><strong>{human(week)} – {human(addDays(week,6))}</strong><button aria-label="Next week" onClick={()=>setWeek(addDays(week,7))}>→</button></div></div>
     <div className="calendar-controls"><label>Location <select value={view} onChange={e=>setView(e.target.value)}><option>All rooms</option>{rooms.map(r=><option key={r}>{r}</option>)}</select></label><span className="legend"><i className="free"/> Available</span><span className="legend"><i className="booked"/> Reserved</span><span className="legend"><i className="mine-sw"/> Your booking</span><span className="legend"><i className="sel-sw"/> Your selection</span>{editing&&<span className="legend"><i className="edit-sw"/> Editing</span>}</div>
     {hasSelection&&<div className={'selbar '+(status.kind==='ok'?'good':'bad')} role="status"><span><strong>{status.room}</strong> · {rangeText} · {status.kind==='ok'?'Available':'Conflict'}{anchor&&' · select another day to extend'}</span><button type="button" onClick={()=>go('Book a room',true)}>{status.kind==='ok'?(editing?'Review changes →':'Continue to booking →'):'See alternatives →'}</button><button type="button" className="ghost" onClick={clearForm}>{editing?'Stop editing':'Clear selection'}</button></div>}
     <div className="calendar-scroll"><div className="room-cal"><div className="corner">ROOM / DATE</div>{days.map(d=><div className="dayhead" key={d}><strong>{weekDay(d)}</strong><span>{human(d)}</span></div>)}{roomList.map(room=><React.Fragment key={room}><div className="roomname"><strong>{room}</strong><small>Study room · {room[0]}</small></div>{days.map(day=>{
       const b=occupied(room,day);
       const mine=b&&b.owner==='you';
       const sel=hasSelection&&same(status.room,room)&&day>=form.startDate&&day<=form.endDate;
       let cls,main,sub='';
       if(b&&b.id===editing){cls='editing';main='Editing';sub='Your booking';}
       else if(sel&&b){cls='clash';main='Conflict';sub='Already reserved';}
       else if(sel){cls='selected';main='Selected';sub=anchor&&same(anchor.room,room)&&day===anchor.date?'Pick last day':'';}
       else if(mine){cls='mine';main='Yours';}
       else if(b){cls='taken';main='Booked';sub='Reserved';}
       else{cls='available';main='Open';}
       const locked=b&&b.id!==editing&&!mine;
       return <button type="button" key={room+day} aria-disabled={locked||undefined} aria-label={`${room}, ${weekDay(day)} ${human(day)}: ${cls==='mine'?'Your booking, select to edit':cls==='available'?'Open, select to start':main}`} className={'slot '+cls} onClick={()=>{if(b&&b.id!==editing){if(mine)edit(b);return;}pick(room,day);}}><span>{main}</span>{sub&&<small>{sub}</small>}</button>;
      })}</React.Fragment>)}</div></div>
     <p className="calendar-note">Cells show individual dates. Reservations may span several dates; a day marked "Open" does not guarantee the full range you choose will be available.</p>
    </section>
   </>}

   {tab==='Book a room'&&<section className="booking-page">
    <button type="button" className="back-link" onClick={()=>go('Availability')}>← Back to calendar</button>
    <div className="booking-layout">
    <div className="booking-pane" id="booking-form"><div className="panel-tag"><span>BOOK A ROOM</span><span>FORM 01</span></div><h2 ref={headingRef} tabIndex={-1}>{editing?'Change reservation':'Make a reservation'}</h2><p className="booking-description">Use this page to request a room for your study group, meeting or activity.</p>
     {editingRow&&<div className="editing-banner"><div><small>Editing your booking</small><strong>{editingRow.roomNumber} · {rangeLabel(editingRow.startDate,editingRow.endDate)}</strong></div>{!confirmDelete?<button type="button" className="danger-link" onClick={()=>setConfirmDelete(true)}>Delete booking</button>:<div className="confirm" role="alertdialog" aria-label="Confirm deletion"><span>Delete this booking?</span><button type="button" className="danger" onClick={removeBooking}>Yes, delete</button><button type="button" className="ghost" onClick={()=>setConfirmDelete(false)}>Keep it</button></div>}</div>}
     <form onSubmit={submit} noValidate><label><span>Room number</span><input ref={roomRef} list="rooms" placeholder="e.g., B2-104" value={form.roomNumber} aria-invalid={invalid.roomNumber||undefined} className={invalid.roomNumber?'invalid':''} onChange={e=>{setAnchor(null);setForm(f=>({...f,roomNumber:e.target.value}));}}/><datalist id="rooms">{rooms.map(r=><option key={r} value={r}/>)}</datalist></label><div className="date-pair"><label><span>Start date</span><input type="date" value={form.startDate} aria-invalid={invalid.startDate||undefined} className={invalid.startDate?'invalid':''} onChange={e=>setStart(e.target.value)}/></label><label><span>End date (included)</span><input type="date" min={form.startDate||undefined} value={form.endDate} aria-invalid={invalid.endDate||undefined} className={invalid.endDate?'invalid':''} onChange={e=>setEnd(e.target.value)}/></label></div><label><span>Purpose / optional</span><textarea rows="4" placeholder="Meeting, group study..." value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}/></label><p className="helper">Start and end dates are required and both days are booked. Reservations cannot overlap existing bookings for the same room.</p>
      {renderStatus()}
      <button className="link-btn" type="button" onClick={()=>go('Availability')}>{hasSelection?'View these dates in the calendar':'Pick dates in the calendar instead'}</button>
      <div className="form-actions"><button className="availability-check" type="button" onClick={check}>Check availability</button>{editing&&<button className="cancel-edit" type="button" onClick={clearForm}>Cancel editing</button>}<button className="reserve-button" type="submit">{editing?'Save booking':'Confirm booking'}</button></div></form><div className="right-foot"><span>✦</span> Need a room for a group? Find an open date and submit your request.</div></div>
   
    <section className="mybookings-page" aria-label="Your bookings"><div className="page-head"><div><h2>Your bookings</h2><p>Rooms you have already reserved. Select Change to edit or delete one.</p></div></div>
    <section id="my-reservations" className="reservations"><div className="reservations-head"><h2>Your bookings</h2><span>{filtered?`${shownBookings.length} of ${myBookings.length}`:myBookings.length} current records</span></div><div className="list-tools"><div className="seg" role="group" aria-label="Order bookings by"><span>Order by</span><button type="button" aria-pressed={sortBy==='room'} className={sortBy==='room'?'on':''} onClick={()=>setSortBy('room')}>Room</button><button type="button" aria-pressed={sortBy==='date'} className={sortBy==='date'?'on':''} onClick={()=>setSortBy('date')}>Date</button></div><label className="dayfilter"><span>Building</span><select value={building} onChange={e=>setBuilding(e.target.value)}><option value="All">All buildings</option>{buildings.map(x=><option key={x} value={x}>Building {x}</option>)}</select></label><label className="dayfilter"><span>Show day</span><input type="date" value={dayFilter} onChange={e=>setDayFilter(e.target.value)}/></label>{filtered&&<button type="button" className="link-btn" onClick={clearFilters}>Clear filters</button>}</div><div className="reservations-list">{shownBookings.map(b=><article key={b.id} className={'reservation'+(b.id===editing?' is-editing':'')}><div className="room-chip">{b.roomNumber}</div><div className="reservation-body"><strong>{rangeLabel(b.startDate,b.endDate)}</strong><small>{b.purpose||'No purpose entered'}</small></div><button type="button" aria-label={`Change booking ${b.roomNumber}`} onClick={()=>edit(b)}>{b.id===editing?'Editing':'Change'}</button></article>)}{myBookings.length===0&&<p>No reservations yet. <button type="button" className="link-btn" onClick={()=>go('Availability')}>Find a room</button></p>}{myBookings.length>0&&shownBookings.length===0&&<p>No bookings match these filters. <button type="button" className="link-btn" onClick={clearFilters}>Show all bookings</button></p>}</div></section>
   </section>
    </div>
   </section>}
  </main><footer>ROOMGRID / Academic campus demo — local browser data only.</footer>
 </div>;
}