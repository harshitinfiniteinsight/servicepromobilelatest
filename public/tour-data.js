/* ─────────────────────────────────────────────────────────────────
   tour-data.js  –  Business-type-specific mock data for all tour pages.
   Keys match the values stored in localStorage as 'ob_biz_type'
   (set by onboarding-welcome.html):
   hvac | plumbing | electrical | carpentry | exterminators |
   landscaping | cleaning | painter | construction | roofing |
   general | other
   ───────────────────────────────────────────────────────────────── */
var TOUR_BIZ_DATA = (function () {

  /* ── badge helpers ─────────────────────────────────────── */
  function badgeHtml(code) {
    var map = {
      prog:    '<span class="badge b-prog">In Progress</span>',
      sched:   '<span class="badge b-sched">Scheduled</span>',
      pay:     '<span class="badge b-pay">Pending Payment</span>',
      done:    '<span class="badge b-done">Done</span>',
      conf:    '<span class="badge b-conf">Confirmed</span>',
      new:     '<span class="badge b-new">New</span>',
      paid:    '<span class="badge b-paid">✓ Paid</span>',
      overdue: '<span class="badge b-overdue">Overdue</span>',
      pending: '<span class="badge b-pending">Pending</span>',
    };
    return map[code] || '';
  }

  /* ── build functions ────────────────────────────────────── */
  function biz(jobs, appointments, customers, documents, inventory, payments, sell, teamsync) {
    return { jobs: jobs, appointments: appointments, customers: customers,
             documents: documents, inventory: inventory, payments: payments,
             sell: sell, teamsync: teamsync };
  }

  /* Helpers so callers can access badgeHtml */
  TOUR_BIZ_DATA_BADGE = badgeHtml;

  /* ── DATA ───────────────────────────────────────────────── */
  return {

    /* ════════════════════════════════════════════════════════
       HVAC  –  exact match of legacy hardcoded content
       ════════════════════════════════════════════════════════ */
    hvac: biz(
      /* jobs */
      {
        board: [
          { id:'JOB-2847', customer:'Emma Davis',    type:'HVAC Service Call + Filter Replacement', badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora',    tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson'  } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Annual AC Maintenance',                  badge:'sched', time:'Today, 2:00 PM',  address:null,                    tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Duct Cleaning + Inspection',             badge:'pay',   time:null,              address:null,                    tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail: {
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'HVAC Service Call', subServices:'Filter Replacement · Duct Inspection',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Technician · En route' },
          checklist:[
            { text:'Replace MERV-11 air filter',    state:'done'   },
            { text:'Inspect ductwork for leaks',    state:'done'   },
            { text:'Check refrigerant levels',      state:'inprog' },
            { text:'Test thermostat calibration',   state:'pending'}
          ],
          notes:'"Please arrive before 10:30 AM. Dog will be put away. Back gate code: 4421."',
          completedSummary:'✓ Filter replaced · ✓ Ducts inspected · ✓ Refrigerant OK'
        },
        invoice: {
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'HVAC Service Call',       price:'$120.00' },
            { name:'Filter Replacement (×2)', price:'$17.00'  },
            { name:'Duct Inspection',         price:'$80.00'  }
          ],
          total:'$217.00'
        }
      },
      /* appointments */
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'HVAC Inspection',    tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Annual Maintenance',  tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'AC Maintenance',      tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'AC Replacement',      tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'AC Maintenance', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Annual AC maintenance inspection','Refrigerant level check','Filter replacement (MERV-11)','Thermostat calibration test'],
          reminderContext:'your AC Maintenance appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      /* customers */
      {
        jobs:[
          { id:'JOB-2847', type:'HVAC Service Call', status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',          amount:'$217.00'   },
          { id:'JOB-2801', type:'Duct Cleaning',      status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson',  amount:'$285.00'   },
          { id:'JOB-2764', type:'AC Maintenance',      status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',   amount:'$320.00'   },
          { id:'JOB-2721', type:'HVAC Install',        status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson',  amount:'$3,200.00' }
        ]
      },
      /* documents */
      {
        listDesc:'Annual HVAC Service Agreement · $2,400/yr',
        agreementType:'HVAC Service Agreement',
        coverage:'Annual AC + Furnace maintenance, 2 visits per year',
        amount:'$1,800',
        signConfirm:'Robert Miller signed the HVAC Service Agreement.'
      },
      /* inventory */
      {
        items:[
          { sku:'REF-410A-25',    name:'R-410A Refrigerant (25 lb)',        stock:3,  total:20, price:'$186.00', state:'low', pct:15 },
          { sku:'FLT-16201-M11',  name:'HVAC Air Filter 16x20x1 MERV-11',  stock:48, total:60, price:'$8.50',   state:'ok',  pct:80 },
          { sku:'THERM-SM-PRG',   name:'Smart Thermostat (Programmable)',   stock:5,  total:25, price:'$89.00',  state:'med', pct:20 }
        ],
        reorder:{
          alertItem:'R-410A Refrigerant',
          alertDesc:'R-410A Refrigerant is critically low (3 units). You have 2 jobs next week requiring this part.',
          itemName:'R-410A Refrigerant 25 lb', qty:20, cost:'$3,720',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'AC replacement',   needs:'3 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Refrigerant top-up', needs:'1 unit'  }
          ],
          confirmItem:'R-410A Refrigerant', confirmQty:'20 units', confirmCost:'$3,720.00'
        }
      },
      /* payments */
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'HVAC Service + Filter Replacement', badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$485.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Annual AC Maintenance',              badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$320.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Furnace Tune-Up + Thermostat',      badge:'pending', date:'Due Feb 2, 2024',           amount:'$285.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'AC Maintenance (2hr labour)', price:'$160.00' },
            { name:'Refrigerant top-up',          price:'$85.00'  },
            { name:'Filter replacement (×1)',     price:'$8.50'   },
            { name:'Service call fee',            price:'$35.00'  },
            { name:'Tax (8.5%)',                  price:'$24.38'  }
          ],
          total:'$312.88'
        }
      },
      /* sell */
      {
        products:[
          { name:'HVAC Filter 16x20x1',  sku:'FLT-16201', stock:'48 in stock', price:'$8.50',   qty:2, added:true  },
          { name:'Smart Thermostat Pro', sku:'THERM-SM',  stock:'5 in stock',  price:'$89.00',  qty:1, added:true  },
          { name:'Capacitor 45/5 MFD',  sku:'CAP-455',   stock:'18 in stock', price:'$22.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',  sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'HVAC Filter 16x20x1',  qty:2, unitPrice:'$8.50',   total:'$17.00'  },
            { name:'Smart Thermostat Pro', qty:1, unitPrice:'$89.00',  total:'$89.00'  },
            { name:'Service Labour (1hr)',  qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$226.00', discount:'−$22.60', tax:'$17.21', total:'$220.61'
        }
      },
      /* teamsync */
      {
        techRole:'HVAC Tech',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'HVAC Inspection', address:'123 Main St', status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'HVAC Service',    address:'321 Elm St', status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'AC Unit Install', address:'135 Spruce Ave', status:'Scheduled',statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'AC Maintenance',  address:'654 Maple Dr', status:'Scheduled',  statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',  address:'246 Birch St', status:'Scheduled',  statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       ELECTRICAL
       ════════════════════════════════════════════════════════ */
    electrical: biz(
      /* jobs */
      {
        board:[
          { id:'JOB-3112', customer:'James Carter',  type:'Motor Repair + Panel Check',  badge:'prog',  time:'Today, 9:00 AM',  address:'88 Oak Ave, Naperville', tech:{ init:'DL', bg:'#f85520', name:'Dave Lee'    } },
          { id:'JOB-3111', customer:'Maria Nguyen',  type:'Switchboard Repair',           badge:'sched', time:'Today, 1:00 PM',  address:null,                    tech:{ init:'JS', bg:'#0891b2', name:'James Smith'  } },
          { id:'JOB-3110', customer:'Kevin Brown',   type:'Wiring Inspection',            badge:'pay',   time:null,              address:null,                    tech:{ init:'RP', bg:'#16a34a', name:'Ryan Park'    } }
        ],
        detail:{
          id:'JOB-3112', customer:'James Carter',
          jobType:'Motor Repair', subServices:'Panel Check · Automated Lighting',
          tech:{ init:'DL', name:'Dave Lee', title:'Lead Electrician · On site' },
          checklist:[
            { text:'Diagnose motor fault',              state:'done'   },
            { text:'Replace faulty capacitor',          state:'done'   },
            { text:'Test panel circuit breakers',       state:'inprog' },
            { text:'Verify wiring continuity',          state:'pending'}
          ],
          notes:'"Please park in the back driveway. Main panel is in the utility room."',
          completedSummary:'✓ Motor repaired · ✓ Capacitor replaced · ✓ Panel checked'
        },
        invoice:{
          customer:'James Carter', jobNum:'3112', phone:'(555) 321-4567',
          items:[
            { name:'Motor Repair',               price:'$150.00' },
            { name:'Capacitor Replacement (×1)', price:'$45.00'  },
            { name:'Panel Inspection',           price:'$80.00'  }
          ],
          total:'$275.00'
        }
      },
      /* appointments */
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Motor Repair',          tech:'Dave L.',  badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Wiring Inspection',     tech:'Ryan P.',  badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Switchboard Repair',    tech:'James S.', badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Lighting System Install',tech:'Dave L.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Switchboard Repair', address:'654 Maple Dr', tech:'James Smith',
          services:['Inspect main switchboard panel','Test circuit breakers','Check wiring and grounding','Replace faulty components'],
          reminderContext:'your Switchboard Repair appointment is today at 2:00 PM. James Smith will arrive at 654 Maple Dr'
        }
      },
      /* customers */
      {
        jobs:[
          { id:'JOB-3112', type:'Motor Repair',       status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Dave Lee',            amount:'$275.00'   },
          { id:'JOB-3078', type:'Wiring Inspection',   status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Ryan Park',   amount:'$195.00'   },
          { id:'JOB-3041', type:'Switchboard Repair',  status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Dave Lee',     amount:'$320.00'   },
          { id:'JOB-2998', type:'Panel Upgrade',       status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Dave Lee',    amount:'$1,800.00' }
        ]
      },
      /* documents */
      {
        listDesc:'Annual Electrical Service Agreement · $1,800/yr',
        agreementType:'Electrical Service Agreement',
        coverage:'Annual panel inspection + 2 service calls per year',
        amount:'$1,500',
        signConfirm:'Robert Miller signed the Electrical Service Agreement.'
      },
      /* inventory */
      {
        items:[
          { sku:'CB-20A-SQ',      name:'Circuit Breaker 20A',      stock:3,  total:25, price:'$18.50', state:'low', pct:12 },
          { sku:'WIRE-12AWG-100', name:'THHN Wire 12 AWG 100ft',   stock:42, total:50, price:'$32.00', state:'ok',  pct:84 },
          { sku:'GFCI-DPX-WH',   name:'GFCI Outlet (Duplex)',      stock:7,  total:30, price:'$14.00', state:'med', pct:23 }
        ],
        reorder:{
          alertItem:'Circuit Breaker 20A',
          alertDesc:'Circuit Breaker 20A is critically low (3 units). You have 2 jobs next week requiring this part.',
          itemName:'Circuit Breaker 20A', qty:25, cost:'$462',
          jobs:[
            { id:'JOB-3118', customer:'Lisa Anderson', date:'Feb 1', jobType:'Panel upgrade',        needs:'4 units' },
            { id:'JOB-3122', customer:'Sarah J.',       date:'Feb 4', jobType:'Breaker replacement',  needs:'2 units' }
          ],
          confirmItem:'Circuit Breaker 20A', confirmQty:'25 units', confirmCost:'$462.50'
        }
      },
      /* payments */
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Automated Lighting System Install', badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$520.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Switchboard Repair',                badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$380.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Wiring Inspection + Repair',        badge:'pending', date:'Due Feb 2, 2024',           amount:'$265.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Switchboard repair (2hr labour)', price:'$160.00' },
            { name:'Breaker replacements (×3)',        price:'$55.50'  },
            { name:'Wire connector fittings',          price:'$28.00'  },
            { name:'Service call fee',                 price:'$35.00'  },
            { name:'Tax (8.5%)',                       price:'$23.67'  }
          ],
          total:'$302.17'
        }
      },
      /* sell */
      {
        products:[
          { name:'Circuit Breaker 20A',  sku:'CB-20A',     stock:'3 in stock',  price:'$18.50',  qty:2, added:true  },
          { name:'THHN Wire 12 AWG',     sku:'WIRE-12AWG', stock:'42 in stock', price:'$32.00',  qty:1, added:true  },
          { name:'GFCI Outlet Duplex',   sku:'GFCI-DPX',   stock:'7 in stock',  price:'$14.00',  qty:1, added:false },
          { name:'Service Labour (1hr)', sku:'LAB-HR',      stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Circuit Breaker 20A',  qty:2, unitPrice:'$18.50',  total:'$37.00'  },
            { name:'THHN Wire 12 AWG',     qty:1, unitPrice:'$32.00',  total:'$32.00'  },
            { name:'Service Labour (1hr)', qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$189.00', discount:'−$18.90', tax:'$14.38', total:'$184.48'
        }
      },
      /* teamsync */
      {
        techRole:'Electrician',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'DL', bg:'#f85520' }, customer:'John Smith',    type:'Motor Repair',       address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'DL', bg:'#f85520' }, customer:'Emma Davis',    type:'Lighting Install',   address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'RP', bg:'#16a34a' }, customer:'Lisa Anderson', type:'Wiring Inspection',  address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'JS', bg:'#0891b2' }, customer:'Robert Miller', type:'Switchboard Repair', address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'DL', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',     address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       PLUMBING
       ════════════════════════════════════════════════════════ */
    plumbing: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Pipe Repair + Leak Fix',         badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Water Heater Service',            badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Drain Cleaning + Inspection',    badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Pipe Repair', subServices:'Leak Fix · Pressure Test',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Plumber · En route' },
          checklist:[
            { text:'Locate and isolate the leak',     state:'done'   },
            { text:'Replace damaged pipe section',    state:'done'   },
            { text:'Test water pressure',             state:'inprog' },
            { text:'Inspect all drain lines',         state:'pending'}
          ],
          notes:'"Please turn off the main water supply before arrival. Gate code: 4421."',
          completedSummary:'✓ Leak fixed · ✓ Pipe replaced · ✓ Pressure normal'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Pipe Repair',           price:'$110.00' },
            { name:'PVC Pipe Section (×2)', price:'$24.00'  },
            { name:'Drain Inspection',      price:'$75.00'  }
          ],
          total:'$209.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Pipe Inspection',       tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Leak Repair',           tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Water Heater Service',  tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Drain Replacement',     tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Water Heater Service', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Flush water heater tank','Inspect anode rod and replace','Check pressure relief valve','Test all supply connections'],
          reminderContext:'your Water Heater Service appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Pipe Repair',          status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$209.00'   },
          { id:'JOB-2801', type:'Drain Cleaning',        status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$180.00'   },
          { id:'JOB-2764', type:'Water Heater Service',  status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$310.00'   },
          { id:'JOB-2721', type:'Full Re-pipe',          status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$4,200.00' }
        ]
      },
      {
        listDesc:'Annual Plumbing Service Agreement · $1,800/yr',
        agreementType:'Plumbing Service Agreement',
        coverage:'Annual pipe inspection + 2 emergency call-outs per year',
        amount:'$1,600',
        signConfirm:'Robert Miller signed the Plumbing Service Agreement.'
      },
      {
        items:[
          { sku:'PVC-4IN-10FT',  name:'PVC Pipe 4-in × 10ft',     stock:6,  total:40, price:'$22.00', state:'low', pct:15 },
          { sku:'PTFE-ROLL-260', name:'PTFE Thread Seal Tape',     stock:55, total:60, price:'$3.50',  state:'ok',  pct:92 },
          { sku:'BALL-VALVE-34', name:'Ball Valve ¾-in Brass',     stock:8,  total:30, price:'$14.00', state:'med', pct:27 }
        ],
        reorder:{
          alertItem:'PVC Pipe 4-in',
          alertDesc:'PVC Pipe 4-in is critically low (6 units). You have 2 jobs next week requiring this part.',
          itemName:'PVC Pipe 4-in × 10ft', qty:40, cost:'$880',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Re-pipe section',  needs:'4 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Drain line repair', needs:'2 units' }
          ],
          confirmItem:'PVC Pipe 4-in', confirmQty:'40 units', confirmCost:'$880.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Pipe Repair + Leak Fix',        badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$420.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Water Heater Service',          badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$310.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Drain Cleaning + Inspection',  badge:'pending', date:'Due Feb 2, 2024',           amount:'$180.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Water heater flush (2hr)',  price:'$160.00' },
            { name:'Anode rod replacement',     price:'$45.00'  },
            { name:'Pressure valve check',      price:'$30.00'  },
            { name:'Service call fee',          price:'$35.00'  },
            { name:'Tax (8.5%)',                price:'$23.12'  }
          ],
          total:'$293.12'
        }
      },
      {
        products:[
          { name:'PVC Pipe 4-in × 10ft', sku:'PVC-4IN',   stock:'6 in stock',  price:'$22.00',  qty:2, added:true  },
          { name:'Ball Valve ¾-in Brass',sku:'BALL-34',   stock:'8 in stock',  price:'$14.00',  qty:1, added:true  },
          { name:'PTFE Seal Tape',        sku:'PTFE-260',  stock:'55 in stock', price:'$3.50',   qty:1, added:false },
          { name:'Service Labour (1hr)',  sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'PVC Pipe 4-in × 10ft', qty:2, unitPrice:'$22.00',  total:'$44.00'  },
            { name:'Ball Valve ¾-in Brass',qty:1, unitPrice:'$14.00',  total:'$14.00'  },
            { name:'Service Labour (1hr)',  qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$178.00', discount:'−$17.80', tax:'$13.55', total:'$173.75'
        }
      },
      {
        techRole:'Plumber',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Pipe Inspection',      address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Pipe Repair',          address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Drain Replacement',    address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Water Heater Service', address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',       address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       CARPENTRY
       ════════════════════════════════════════════════════════ */
    carpentry: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Cabinet Install + Trim Work',  badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Custom Door Frame',             badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Deck Repair + Staining',       badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Cabinet Install', subServices:'Trim Work · Hardware Fitting',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Carpenter · On site' },
          checklist:[
            { text:'Measure and mark mounting points', state:'done'   },
            { text:'Install cabinet boxes and frames',  state:'done'   },
            { text:'Attach doors and hardware',         state:'inprog' },
            { text:'Apply trim and touch-up finish',    state:'pending'}
          ],
          notes:'"Please arrive before 10:30 AM. Use side door entrance."',
          completedSummary:'✓ Cabinets installed · ✓ Hardware fitted · ✓ Trim applied'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Cabinet Installation',    price:'$280.00' },
            { name:'Hardware Set (×6)',       price:'$48.00'  },
            { name:'Trim & Finish Work',      price:'$95.00'  }
          ],
          total:'$423.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Shelf Installation',   tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Cabinet Install',       tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Custom Door Frame',     tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Deck Board Repair',    tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Custom Door Frame', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Measure and cut door frame components','Sand and prime all surfaces','Install frame and test alignment','Apply finish coat and hardware'],
          reminderContext:'your Custom Door Frame appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Cabinet Install',   status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$423.00'   },
          { id:'JOB-2801', type:'Deck Repair',        status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$350.00'   },
          { id:'JOB-2764', type:'Door Frame Install', status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$290.00'   },
          { id:'JOB-2721', type:'Full Kitchen Fit',   status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$5,800.00' }
        ]
      },
      {
        listDesc:'Annual Carpentry Service Agreement · $1,600/yr',
        agreementType:'Carpentry Service Agreement',
        coverage:'Annual furniture maintenance + 2 priority call-outs per year',
        amount:'$1,400',
        signConfirm:'Robert Miller signed the Carpentry Service Agreement.'
      },
      {
        items:[
          { sku:'OAK-PLK-8FT',  name:'Hardwood Oak Plank 8ft',   stock:4,  total:30, price:'$38.00', state:'low', pct:13 },
          { sku:'WOOD-STAIN-QT', name:'Wood Stain (Quart)',        stock:22, total:25, price:'$18.00', state:'ok',  pct:88 },
          { sku:'CAB-HW-SET',   name:'Cabinet Hardware Set',       stock:6,  total:20, price:'$24.00', state:'med', pct:30 }
        ],
        reorder:{
          alertItem:'Hardwood Oak Plank',
          alertDesc:'Hardwood Oak Plank is critically low (4 units). You have 2 jobs next week requiring this part.',
          itemName:'Hardwood Oak Plank 8ft', qty:30, cost:'$1,140',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Deck install',   needs:'8 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Cabinet facing',  needs:'4 units' }
          ],
          confirmItem:'Hardwood Oak Plank', confirmQty:'30 units', confirmCost:'$1,140.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Cabinet Install + Trim Work',   badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$423.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Custom Door Frame',             badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$290.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Deck Repair + Staining',       badge:'pending', date:'Due Feb 2, 2024',           amount:'$350.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Cabinet installation (3hr)', price:'$240.00' },
            { name:'Hardware set (×6)',           price:'$48.00'  },
            { name:'Trim work',                  price:'$95.00'  },
            { name:'Service call fee',           price:'$35.00'  },
            { name:'Tax (8.5%)',                 price:'$35.91'  }
          ],
          total:'$453.91'
        }
      },
      {
        products:[
          { name:'Hardwood Oak Plank 8ft',  sku:'OAK-8FT',   stock:'4 in stock',  price:'$38.00',  qty:2, added:true  },
          { name:'Cabinet Hardware Set',    sku:'CAB-HW',    stock:'6 in stock',  price:'$24.00',  qty:1, added:true  },
          { name:'Wood Stain (Quart)',      sku:'STAIN-QT',  stock:'22 in stock', price:'$18.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',    sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Hardwood Oak Plank 8ft',qty:2, unitPrice:'$38.00',  total:'$76.00'  },
            { name:'Cabinet Hardware Set',  qty:1, unitPrice:'$24.00',  total:'$24.00'  },
            { name:'Service Labour (1hr)',  qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$220.00', discount:'−$22.00', tax:'$16.83', total:'$214.83'
        }
      },
      {
        techRole:'Carpenter',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Shelf Installation', address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Cabinet Install',    address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Deck Board Repair',  address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Door Frame Install', address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Repair',   address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       EXTERMINATORS
       ════════════════════════════════════════════════════════ */
    exterminators: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Pest Inspection + Treatment',  badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Termite Treatment',             badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Rodent Control + Exclusion',   badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Pest Inspection', subServices:'Treatment · Exclusion Sealing',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Technician · En route' },
          checklist:[
            { text:'Complete interior inspection',     state:'done'   },
            { text:'Apply perimeter treatment',        state:'done'   },
            { text:'Set bait stations and traps',      state:'inprog' },
            { text:'Seal entry points and gaps',       state:'pending'}
          ],
          notes:'"Please have all pets secured before arrival. Side gate is unlocked."',
          completedSummary:'✓ Inspected · ✓ Treatment applied · ✓ Stations set'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Pest Inspection',           price:'$80.00'  },
            { name:'Perimeter Treatment',       price:'$120.00' },
            { name:'Bait Station Setup (×4)',   price:'$60.00'  }
          ],
          total:'$260.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Pest Inspection',       tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Annual Pest Control',   tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Termite Treatment',     tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Rodent Exclusion',      tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Termite Treatment', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Full termite inspection of structure','Apply liquid termiticide barrier','Install termite bait stations','Follow-up inspection scheduled'],
          reminderContext:'your Termite Treatment appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Pest Inspection',     status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$260.00'   },
          { id:'JOB-2801', type:'Rodent Control',       status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$195.00'   },
          { id:'JOB-2764', type:'Termite Treatment',    status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$450.00'   },
          { id:'JOB-2721', type:'Full Pest Control Plan',status:'Paid ✓',     statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$1,200.00' }
        ]
      },
      {
        listDesc:'Annual Pest Control Agreement · $1,200/yr',
        agreementType:'Pest Control Service Agreement',
        coverage:'Quarterly treatments + unlimited call-outs for 12 months',
        amount:'$1,100',
        signConfirm:'Robert Miller signed the Pest Control Service Agreement.'
      },
      {
        items:[
          { sku:'TERM-BAIT-10', name:'Termite Bait Station (10pk)',  stock:5,  total:30, price:'$45.00', state:'low', pct:17 },
          { sku:'PERI-SPRAY-1G', name:'Perimeter Spray Concentrate', stock:18, total:20, price:'$28.00', state:'ok',  pct:90 },
          { sku:'GLUE-TRAP-24',  name:'Rodent Glue Trap (24pk)',     stock:7,  total:25, price:'$12.00', state:'med', pct:28 }
        ],
        reorder:{
          alertItem:'Termite Bait Station',
          alertDesc:'Termite Bait Station is critically low (5 units). You have 2 jobs next week requiring this part.',
          itemName:'Termite Bait Station 10pk', qty:30, cost:'$1,350',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Termite prevention', needs:'3 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Station replacement', needs:'2 units' }
          ],
          confirmItem:'Termite Bait Station', confirmQty:'30 units', confirmCost:'$1,350.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Pest Inspection + Treatment',   badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$260.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Termite Treatment',             badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$450.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Rodent Control + Exclusion',   badge:'pending', date:'Due Feb 2, 2024',           amount:'$195.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Termite inspection (1.5hr)', price:'$120.00' },
            { name:'Liquid termiticide barrier', price:'$180.00' },
            { name:'Bait stations (×4)',         price:'$60.00'  },
            { name:'Service call fee',           price:'$35.00'  },
            { name:'Tax (8.5%)',                 price:'$33.49'  }
          ],
          total:'$428.49'
        }
      },
      {
        products:[
          { name:'Termite Bait Station (10pk)', sku:'TERM-BAIT', stock:'5 in stock',  price:'$45.00',  qty:2, added:true  },
          { name:'Perimeter Spray Conc.',        sku:'PERI-SP',   stock:'18 in stock', price:'$28.00',  qty:1, added:true  },
          { name:'Rodent Glue Trap (24pk)',      sku:'GLUE-TR',   stock:'7 in stock',  price:'$12.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',          sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Termite Bait Station (10pk)', qty:2, unitPrice:'$45.00',  total:'$90.00'  },
            { name:'Perimeter Spray Conc.',        qty:1, unitPrice:'$28.00',  total:'$28.00'  },
            { name:'Service Labour (1hr)',          qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$238.00', discount:'−$23.80', tax:'$18.22', total:'$232.42'
        }
      },
      {
        techRole:'Pest Control Tech',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Pest Inspection',  address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Treatment',        address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Rodent Exclusion', address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Termite Treatment',address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',   address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       LANDSCAPING
       ════════════════════════════════════════════════════════ */
    landscaping: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Lawn Care + Fertilization',    badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Tree Trimming Service',         badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Sprinkler System Repair',       badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Lawn Care', subServices:'Fertilization · Aeration',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Landscaper · En route' },
          checklist:[
            { text:'Mow and edge all lawn areas',      state:'done'   },
            { text:'Apply seasonal fertilizer',        state:'done'   },
            { text:'Aerate lawn and spread seed',      state:'inprog' },
            { text:'Clean up and remove clippings',    state:'pending'}
          ],
          notes:'"Back gate code is 4421. Please avoid disturbing the garden beds."',
          completedSummary:'✓ Lawn mowed · ✓ Fertilizer applied · ✓ Aeration done'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Lawn Mow & Edge',        price:'$80.00' },
            { name:'Fertilizer Application', price:'$45.00' },
            { name:'Aeration Service',       price:'$90.00' }
          ],
          total:'$215.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Lawn Mow & Edge',      tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Fertilization',         tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Tree Trimming',         tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Sprinkler Install',     tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Tree Trimming', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Inspect and assess all trees','Remove dead and overhanging branches','Shape and thin canopy for airflow','Clean up and remove all debris'],
          reminderContext:'your Tree Trimming appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Lawn Care',           status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$215.00'   },
          { id:'JOB-2801', type:'Sprinkler Repair',     status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$180.00'   },
          { id:'JOB-2764', type:'Tree Trimming',        status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$320.00'   },
          { id:'JOB-2721', type:'Full Yard Design',     status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$3,800.00' }
        ]
      },
      {
        listDesc:'Annual Landscaping Service Agreement · $2,000/yr',
        agreementType:'Landscaping Service Agreement',
        coverage:'Monthly lawn care + 2 seasonal cleanups per year',
        amount:'$1,800',
        signConfirm:'Robert Miller signed the Landscaping Service Agreement.'
      },
      {
        items:[
          { sku:'FERT-50LB-BAL', name:'Balanced Fertilizer 50lb',   stock:4,  total:20, price:'$42.00', state:'low', pct:20 },
          { sku:'SPKR-HEAD-360', name:'Sprinkler Head 360°',         stock:28, total:30, price:'$9.00',  state:'ok',  pct:93 },
          { sku:'MULCH-2CUFT',   name:'Hardwood Mulch 2 cu ft',      stock:8,  total:30, price:'$6.50',  state:'med', pct:27 }
        ],
        reorder:{
          alertItem:'Balanced Fertilizer',
          alertDesc:'Balanced Fertilizer is critically low (4 units). You have 2 jobs next week requiring this part.',
          itemName:'Balanced Fertilizer 50lb', qty:20, cost:'$840',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Spring fertilization', needs:'3 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Lawn treatment',       needs:'2 units' }
          ],
          confirmItem:'Balanced Fertilizer', confirmQty:'20 units', confirmCost:'$840.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Lawn Care + Fertilization',     badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$215.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Tree Trimming Service',         badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$320.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Sprinkler System Repair',       badge:'pending', date:'Due Feb 2, 2024',           amount:'$180.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Tree trimming (3hr)',   price:'$240.00' },
            { name:'Branch removal fee',   price:'$60.00'  },
            { name:'Debris haul-away',     price:'$40.00'  },
            { name:'Service call fee',     price:'$35.00'  },
            { name:'Tax (8.5%)',           price:'$32.30'  }
          ],
          total:'$407.30'
        }
      },
      {
        products:[
          { name:'Balanced Fertilizer 50lb', sku:'FERT-50',  stock:'4 in stock',  price:'$42.00',  qty:2, added:true  },
          { name:'Sprinkler Head 360°',       sku:'SPKR-360', stock:'28 in stock', price:'$9.00',   qty:1, added:true  },
          { name:'Hardwood Mulch 2 cu ft',   sku:'MULCH-2',  stock:'8 in stock',  price:'$6.50',   qty:1, added:false },
          { name:'Service Labour (1hr)',      sku:'LAB-HR',   stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Balanced Fertilizer 50lb', qty:2, unitPrice:'$42.00',  total:'$84.00'  },
            { name:'Sprinkler Head 360°',       qty:1, unitPrice:'$9.00',   total:'$9.00'   },
            { name:'Service Labour (1hr)',      qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$213.00', discount:'−$21.30', tax:'$16.28', total:'$207.98'
        }
      },
      {
        techRole:'Landscaper',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Lawn Mow & Edge',   address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Fertilization',     address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Sprinkler Install',  address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Tree Trimming',     address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',   address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       CLEANING
       ════════════════════════════════════════════════════════ */
    cleaning: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Deep Clean + Sanitization',    badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Maria Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Post-Construction Cleanup',     badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tina Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Move-In / Move-Out Clean',     badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Deep Clean', subServices:'Sanitization · Window Cleaning',
          tech:{ init:'MJ', name:'Maria Johnson', title:'Lead Cleaner · En route' },
          checklist:[
            { text:'Kitchen deep clean + degrease',    state:'done'   },
            { text:'Bathrooms scrub + sanitize',       state:'done'   },
            { text:'Vacuum and mop all floors',        state:'inprog' },
            { text:'Windows and sills clean',          state:'pending'}
          ],
          notes:'"Use the side entrance. Cleaning supplies are in the garage."',
          completedSummary:'✓ Kitchen cleaned · ✓ Bathrooms done · ✓ Floors mopped'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Deep Clean (4hr)',        price:'$200.00' },
            { name:'Sanitization Treatment', price:'$40.00'  },
            { name:'Window Cleaning (×8)',   price:'$80.00'  }
          ],
          total:'$320.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Office Cleaning',      tech:'Maria J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Deep Clean',           tech:'Tina W.',  badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Post-Build Cleanup',   tech:'Tina W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Move-Out Clean',       tech:'Maria J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Post-Build Cleanup', address:'654 Maple Dr', tech:'Tina Wilson',
          services:['Remove construction debris and dust','Clean all surfaces and fixtures','Vacuum and mop all flooring','Final wipe-down and inspection'],
          reminderContext:'your Post-Build Cleanup appointment is today at 2:00 PM. Tina Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Deep Clean',          status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Maria Johnson',        amount:'$320.00'   },
          { id:'JOB-2801', type:'Office Clean',         status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Maria Johnson',amount:'$180.00'   },
          { id:'JOB-2764', type:'Move-Out Clean',       status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Tina Wilson',   amount:'$240.00'   },
          { id:'JOB-2721', type:'Commercial Deep Clean',status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Team',         amount:'$1,400.00' }
        ]
      },
      {
        listDesc:'Monthly Cleaning Service Agreement · $800/mo',
        agreementType:'Cleaning Service Agreement',
        coverage:'Weekly cleaning visits + monthly deep clean included',
        amount:'$750',
        signConfirm:'Robert Miller signed the Cleaning Service Agreement.'
      },
      {
        items:[
          { sku:'CLEAN-1GAL-AP',  name:'All-Purpose Cleaner 1 gal',  stock:6,  total:30, price:'$14.00', state:'low', pct:20 },
          { sku:'MICROF-10PK',    name:'Microfiber Cloths (10pk)',    stock:45, total:50, price:'$12.00', state:'ok',  pct:90 },
          { sku:'HEPA-VAC-FILT',  name:'HEPA Vacuum Filter',         stock:5,  total:20, price:'$18.00', state:'med', pct:25 }
        ],
        reorder:{
          alertItem:'All-Purpose Cleaner',
          alertDesc:'All-Purpose Cleaner 1 gal is critically low (6 units). You have 2 jobs next week requiring this item.',
          itemName:'All-Purpose Cleaner 1 gal', qty:30, cost:'$420',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Deep clean',    needs:'3 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Move-in clean', needs:'2 units' }
          ],
          confirmItem:'All-Purpose Cleaner', confirmQty:'30 units', confirmCost:'$420.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Deep Clean + Sanitization',    badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$320.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Post-Construction Cleanup',    badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$450.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Move-In / Move-Out Clean',    badge:'pending', date:'Due Feb 2, 2024',           amount:'$240.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Post-build clean (4hr)', price:'$320.00' },
            { name:'Debris removal',         price:'$80.00'  },
            { name:'Floor treatment',        price:'$60.00'  },
            { name:'Service fee',            price:'$35.00'  },
            { name:'Tax (8.5%)',             price:'$41.93'  }
          ],
          total:'$536.93'
        }
      },
      {
        products:[
          { name:'All-Purpose Cleaner 1gal',  sku:'CLEAN-AP',  stock:'6 in stock',  price:'$14.00',  qty:2, added:true  },
          { name:'Microfiber Cloths (10pk)',   sku:'MICROF-10', stock:'45 in stock', price:'$12.00',  qty:1, added:true  },
          { name:'HEPA Vacuum Filter',         sku:'HEPA-VF',   stock:'5 in stock',  price:'$18.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',        sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'All-Purpose Cleaner 1gal', qty:2, unitPrice:'$14.00',  total:'$28.00'  },
            { name:'Microfiber Cloths (10pk)',  qty:1, unitPrice:'$12.00',  total:'$12.00'  },
            { name:'Service Labour (1hr)',       qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$160.00', discount:'−$16.00', tax:'$12.24', total:'$156.24'
        }
      },
      {
        techRole:'Cleaning Tech',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Office Cleaning',    address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Deep Clean',         address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Move-Out Clean',     address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Post-Build Cleanup', address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Clean',   address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       PAINTER
       ════════════════════════════════════════════════════════ */
    painter: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Interior Painting + Prep',     badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Exterior Paint Touch-Up',       badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Trim & Door Painting',          badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Interior Painting', subServices:'Surface Prep · Two-Coat Finish',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Painter · On site' },
          checklist:[
            { text:'Cover furniture and tape edges',   state:'done'   },
            { text:'Apply primer coat to walls',       state:'done'   },
            { text:'Apply first finish coat',          state:'inprog' },
            { text:'Touch-up and remove tape',         state:'pending'}
          ],
          notes:'"Please arrive before 10:30 AM. Use rear entrance."',
          completedSummary:'✓ Surface prepped · ✓ Primer applied · ✓ First coat done'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Interior Paint (2-coat)',  price:'$320.00' },
            { name:'Primer Coat',             price:'$80.00'  },
            { name:'Trim & Detail Work',      price:'$120.00' }
          ],
          total:'$520.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Wall Painting',        tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Interior Painting',    tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Exterior Touch-Up',    tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Garage Floor Coat',    tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Exterior Touch-Up', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Inspect exterior surfaces for damage','Sand and prime peeling areas','Apply matching exterior paint','Clean up and final inspection'],
          reminderContext:'your Exterior Touch-Up appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Interior Painting',  status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$520.00'   },
          { id:'JOB-2801', type:'Trim Painting',       status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$180.00'   },
          { id:'JOB-2764', type:'Exterior Touch-Up',   status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$380.00'   },
          { id:'JOB-2721', type:'Full Home Repaint',   status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$6,200.00' }
        ]
      },
      {
        listDesc:'Annual Paint Maintenance Agreement · $1,200/yr',
        agreementType:'Paint Maintenance Agreement',
        coverage:'Annual exterior touch-up + priority scheduling for 12 months',
        amount:'$1,100',
        signConfirm:'Robert Miller signed the Paint Maintenance Agreement.'
      },
      {
        items:[
          { sku:'EXT-PAINT-1G',  name:'Exterior Paint 1 gallon',   stock:5,  total:30, price:'$48.00', state:'low', pct:17 },
          { sku:'PRIMER-QT',     name:'Interior Primer (Quart)',    stock:22, total:25, price:'$22.00', state:'ok',  pct:88 },
          { sku:'ROLLER-9IN',    name:'Paint Roller 9-in (4pk)',    stock:6,  total:20, price:'$16.00', state:'med', pct:30 }
        ],
        reorder:{
          alertItem:'Exterior Paint',
          alertDesc:'Exterior Paint 1 gallon is critically low (5 units). You have 2 jobs next week requiring this item.',
          itemName:'Exterior Paint 1 gallon', qty:30, cost:'$1,440',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Full exterior repaint', needs:'8 gallons' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Trim repaint',         needs:'3 gallons' }
          ],
          confirmItem:'Exterior Paint', confirmQty:'30 gallons', confirmCost:'$1,440.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Interior Painting + Prep',      badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$520.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Exterior Paint Touch-Up',       badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$380.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Trim & Door Painting',         badge:'pending', date:'Due Feb 2, 2024',           amount:'$180.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Exterior paint (3hr)',  price:'$240.00' },
            { name:'Paint materials (×2gal)',price:'$96.00' },
            { name:'Primer application',   price:'$45.00'  },
            { name:'Service call fee',     price:'$35.00'  },
            { name:'Tax (8.5%)',           price:'$35.33'  }
          ],
          total:'$451.33'
        }
      },
      {
        products:[
          { name:'Exterior Paint 1gal',    sku:'EXT-PAINT', stock:'5 in stock',  price:'$48.00',  qty:2, added:true  },
          { name:'Interior Primer (Qt)',   sku:'PRIMER-QT', stock:'22 in stock', price:'$22.00',  qty:1, added:true  },
          { name:'Paint Roller 9-in (4pk)',sku:'ROLLER-9',  stock:'6 in stock',  price:'$16.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',   sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Exterior Paint 1gal',  qty:2, unitPrice:'$48.00',  total:'$96.00'  },
            { name:'Interior Primer (Qt)', qty:1, unitPrice:'$22.00',  total:'$22.00'  },
            { name:'Service Labour (1hr)', qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$238.00', discount:'−$23.80', tax:'$18.22', total:'$232.42'
        }
      },
      {
        techRole:'Painter',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Wall Painting',     address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Interior Painting', address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Garage Floor Coat', address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Exterior Touch-Up', address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Repaint', address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       CONSTRUCTION
       ════════════════════════════════════════════════════════ */
    construction: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Foundation Repair + Waterproof', badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Framing + Drywall Install',       badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Concrete Pour + Finish',          badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Foundation Repair', subServices:'Waterproofing · Crack Sealing',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Site Foreman · On site' },
          checklist:[
            { text:'Excavate around foundation',        state:'done'   },
            { text:'Seal cracks with epoxy injection',  state:'done'   },
            { text:'Apply waterproof membrane',         state:'inprog' },
            { text:'Backfill and grade drainage',       state:'pending'}
          ],
          notes:'"Access through rear yard. Excavation equipment parked in driveway."',
          completedSummary:'✓ Excavated · ✓ Cracks sealed · ✓ Membrane applied'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Foundation Repair',       price:'$800.00' },
            { name:'Epoxy Crack Injection',  price:'$240.00' },
            { name:'Waterproof Membrane',    price:'$350.00' }
          ],
          total:'$1,390.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Site Inspection',       tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Foundation Repair',     tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Framing Install',       tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Concrete Pour',         tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Framing Install', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Review blueprints and mark stud locations','Install load-bearing wall frames','Secure top and bottom plates','Inspection and sign-off'],
          reminderContext:'your Framing Install appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Foundation Repair',   status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$1,390.00' },
          { id:'JOB-2801', type:'Drywall Install',      status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$820.00'   },
          { id:'JOB-2764', type:'Framing',              status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$1,100.00' },
          { id:'JOB-2721', type:'Full Addition Build',  status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$28,000.00'}
        ]
      },
      {
        listDesc:'Annual Construction Maintenance Agreement · $3,600/yr',
        agreementType:'Construction Maintenance Agreement',
        coverage:'Annual structural inspection + 2 repair call-outs per year',
        amount:'$3,200',
        signConfirm:'Robert Miller signed the Construction Maintenance Agreement.'
      },
      {
        items:[
          { sku:'CONC-80LB',    name:'Concrete Mix 80lb Bag',       stock:8,  total:50, price:'$12.00', state:'low', pct:16 },
          { sku:'REBAR-10FT',   name:'Rebar #4 × 10ft',             stock:35, total:40, price:'$8.50',  state:'ok',  pct:88 },
          { sku:'DW-SHEET-4X8', name:'Drywall Sheet 4×8',           stock:10, total:40, price:'$18.00', state:'med', pct:25 }
        ],
        reorder:{
          alertItem:'Concrete Mix 80lb',
          alertDesc:'Concrete Mix 80lb is critically low (8 units). You have 2 jobs next week requiring this material.',
          itemName:'Concrete Mix 80lb Bag', qty:50, cost:'$600',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Slab pour',     needs:'20 bags' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Pad repair',    needs:'10 bags' }
          ],
          confirmItem:'Concrete Mix 80lb', confirmQty:'50 bags', confirmCost:'$600.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Foundation Repair + Waterproof', badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$1,390.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Framing + Drywall Install',      badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$1,100.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Concrete Pour + Finish',         badge:'pending', date:'Due Feb 2, 2024',           amount:'$820.00',   amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Framing labour (4hr)',    price:'$320.00' },
            { name:'Lumber materials',        price:'$480.00' },
            { name:'Hardware & fasteners',    price:'$85.00'  },
            { name:'Service call fee',        price:'$35.00'  },
            { name:'Tax (8.5%)',              price:'$78.20'  }
          ],
          total:'$998.20'
        }
      },
      {
        products:[
          { name:'Concrete Mix 80lb',    sku:'CONC-80',  stock:'8 in stock',  price:'$12.00',  qty:5, added:true  },
          { name:'Rebar #4 × 10ft',      sku:'REBAR-4',  stock:'35 in stock', price:'$8.50',   qty:2, added:true  },
          { name:'Drywall Sheet 4×8',    sku:'DW-4X8',   stock:'10 in stock', price:'$18.00',  qty:1, added:false },
          { name:'Service Labour (1hr)', sku:'LAB-HR',   stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Concrete Mix 80lb',   qty:5, unitPrice:'$12.00',  total:'$60.00'  },
            { name:'Rebar #4 × 10ft',     qty:2, unitPrice:'$8.50',   total:'$17.00'  },
            { name:'Service Labour (1hr)',qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$197.00', discount:'−$19.70', tax:'$15.07', total:'$192.37'
        }
      },
      {
        techRole:'Construction Worker',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Site Inspection',    address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Foundation Repair',  address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Concrete Pour',      address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Framing Install',    address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',     address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       ROOFING
       ════════════════════════════════════════════════════════ */
    roofing: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Shingle Replacement + Inspection',badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Leak Repair + Seal',               badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Gutter Clean + Install',           badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Shingle Replacement', subServices:'Underlayment Check · Flashing Seal',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Roofer · On site' },
          checklist:[
            { text:'Remove damaged shingles',           state:'done'   },
            { text:'Inspect and repair underlayment',   state:'done'   },
            { text:'Install new shingles',              state:'inprog' },
            { text:'Seal flashing and ridge cap',       state:'pending'}
          ],
          notes:'"Ladder access is on the left side of the house. Back gate code: 4421."',
          completedSummary:'✓ Old shingles removed · ✓ Underlayment fixed · ✓ New shingles installed'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Shingle Replacement (2 sq)', price:'$480.00' },
            { name:'Underlayment Repair',        price:'$120.00' },
            { name:'Flashing & Sealing',         price:'$95.00'  }
          ],
          total:'$695.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Roof Inspection',      tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Shingle Replace',      tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Leak Repair',          tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Gutter Install',       tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Leak Repair', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Locate and assess leak source','Remove and replace damaged materials','Apply waterproof sealant','Final water test and inspection'],
          reminderContext:'your Leak Repair appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Shingle Replacement', status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$695.00'   },
          { id:'JOB-2801', type:'Gutter Install',       status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$420.00'   },
          { id:'JOB-2764', type:'Leak Repair',          status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$380.00'   },
          { id:'JOB-2721', type:'Full Roof Replacement',status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$12,500.00'}
        ]
      },
      {
        listDesc:'Annual Roof Maintenance Agreement · $2,800/yr',
        agreementType:'Roof Maintenance Agreement',
        coverage:'Annual inspection + gutter clean + 1 repair call-out per year',
        amount:'$2,400',
        signConfirm:'Robert Miller signed the Roof Maintenance Agreement.'
      },
      {
        items:[
          { sku:'SHGL-ARCH-SQ',  name:'Architectural Shingles (sq)', stock:4,  total:20, price:'$95.00', state:'low', pct:20 },
          { sku:'NAIL-ROOF-1LB', name:'Roofing Nails 1¾-in (1lb)',   stock:28, total:30, price:'$6.00',  state:'ok',  pct:93 },
          { sku:'FLASH-ROLL-10', name:'Aluminum Flashing Roll 10ft',  stock:5,  total:15, price:'$22.00', state:'med', pct:33 }
        ],
        reorder:{
          alertItem:'Architectural Shingles',
          alertDesc:'Architectural Shingles are critically low (4 squares). You have 2 jobs next week requiring this material.',
          itemName:'Architectural Shingles (sq)', qty:20, cost:'$1,900',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Roof replacement', needs:'8 sq' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Section repair',   needs:'3 sq' }
          ],
          confirmItem:'Architectural Shingles', confirmQty:'20 squares', confirmCost:'$1,900.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Shingle Replacement + Inspection', badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$695.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Leak Repair + Seal',              badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$380.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Gutter Clean + Install',          badge:'pending', date:'Due Feb 2, 2024',           amount:'$420.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Leak repair (2hr)',        price:'$160.00' },
            { name:'Sealant and materials',    price:'$85.00'  },
            { name:'Flashing adjustment',      price:'$65.00'  },
            { name:'Service call fee',         price:'$35.00'  },
            { name:'Tax (8.5%)',               price:'$29.34'  }
          ],
          total:'$374.34'
        }
      },
      {
        products:[
          { name:'Architectural Shingles (sq)', sku:'SHGL-ARC',  stock:'4 in stock',  price:'$95.00',  qty:2, added:true  },
          { name:'Roofing Nails (1lb)',          sku:'NAIL-ROOF', stock:'28 in stock', price:'$6.00',   qty:1, added:true  },
          { name:'Aluminum Flashing 10ft',       sku:'FLASH-10',  stock:'5 in stock',  price:'$22.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',          sku:'LAB-HR',    stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Architectural Shingles (sq)', qty:2, unitPrice:'$95.00',  total:'$190.00' },
            { name:'Roofing Nails (1lb)',          qty:1, unitPrice:'$6.00',   total:'$6.00'   },
            { name:'Service Labour (1hr)',          qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$316.00', discount:'−$31.60', tax:'$24.18', total:'$308.58'
        }
      },
      {
        techRole:'Roofer',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Roof Inspection',    address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Shingle Replace',    address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Gutter Install',    address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Leak Repair',        address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',     address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    ),

    /* ════════════════════════════════════════════════════════
       GENERAL  –  fallback for unknown / general business types
       ════════════════════════════════════════════════════════ */
    general: biz(
      {
        board:[
          { id:'JOB-2847', customer:'Emma Davis',    type:'Service Call + Full Assessment', badge:'prog',  time:'Today, 10:00 AM', address:'321 Elm St, Aurora', tech:{ init:'MJ', bg:'#f85520', name:'Mike Johnson' } },
          { id:'JOB-2846', customer:'Robert Miller', type:'Repair & Maintenance',            badge:'sched', time:'Today, 2:00 PM',  address:null,                 tech:{ init:'TW', bg:'#0891b2', name:'Tom Wilson'   } },
          { id:'JOB-2845', customer:'Sarah Johnson', type:'Installation + Setup',            badge:'pay',   time:null,              address:null,                 tech:{ init:'CD', bg:'#16a34a', name:'Chris Davis'  } }
        ],
        detail:{
          id:'JOB-2847', customer:'Emma Davis',
          jobType:'Service Call', subServices:'Assessment · Diagnostics',
          tech:{ init:'MJ', name:'Mike Johnson', title:'Lead Technician · En route' },
          checklist:[
            { text:'Complete on-site assessment',    state:'done'   },
            { text:'Identify and document issues',   state:'done'   },
            { text:'Perform primary repair work',    state:'inprog' },
            { text:'Test and verify all systems',    state:'pending'}
          ],
          notes:'"Please arrive before 10:30 AM. Access code: 4421."',
          completedSummary:'✓ Assessment done · ✓ Issues identified · ✓ Repair underway'
        },
        invoice:{
          customer:'Emma Davis', jobNum:'2847', phone:'(555) 456-7890',
          items:[
            { name:'Service Call',          price:'$120.00' },
            { name:'Parts & Materials',     price:'$45.00'  },
            { name:'Labour (2hr)',           price:'$160.00' }
          ],
          total:'$325.00'
        }
      },
      {
        list:[
          { time:'9:00',  period:'AM', customer:'John Smith',    type:'Service Inspection',   tech:'Mike J.', badge:'done' },
          { time:'11:00', period:'AM', customer:'Emma Davis',    type:'Annual Maintenance',   tech:'Sarah M.',badge:'conf' },
          { time:'2:00',  period:'PM', customer:'Robert Miller', type:'Repair Service',       tech:'Tom W.',  badge:'conf' },
          { time:'4:30',  period:'PM', customer:'Lisa Anderson', type:'Installation',          tech:'Mike J.', badge:'new'  }
        ],
        detail:{
          time:'2:00 PM', customer:'Robert Miller', type:'Repair Service', address:'654 Maple Dr', tech:'Tom Wilson',
          services:['Diagnose issue and document findings','Perform necessary repairs','Test all affected systems','Clean up and final walkthrough'],
          reminderContext:'your Repair Service appointment is today at 2:00 PM. Tom Wilson will arrive at 654 Maple Dr'
        }
      },
      {
        jobs:[
          { id:'JOB-2847', type:'Service Call',        status:'In Progress', statusStyle:'background:#fef3c7;color:#b45309', date:'Today · Mike Johnson',         amount:'$325.00'   },
          { id:'JOB-2801', type:'Maintenance Visit',    status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Dec 12, 2023 · Mike Johnson', amount:'$240.00'   },
          { id:'JOB-2764', type:'Repair Service',       status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Oct 5, 2023 · Mike Johnson',  amount:'$310.00'   },
          { id:'JOB-2721', type:'Full Installation',    status:'Paid ✓',      statusStyle:'background:#dcfce7;color:#15803d', date:'Aug 18, 2023 · Mike Johnson', amount:'$2,400.00' }
        ]
      },
      {
        listDesc:'Annual Service Agreement · $1,800/yr',
        agreementType:'Service Agreement',
        coverage:'Annual inspection + 2 priority call-outs per year',
        amount:'$1,600',
        signConfirm:'Robert Miller signed the Service Agreement.'
      },
      {
        items:[
          { sku:'PARTS-MISC',    name:'Parts & Consumables Pack',  stock:5,  total:20, price:'$35.00', state:'low', pct:25 },
          { sku:'SUPPLY-TOOLS',  name:'General Supplies Kit',      stock:18, total:20, price:'$22.00', state:'ok',  pct:90 },
          { sku:'EQUIP-RENT-HR', name:'Equipment Rental (per hr)', stock:8,  total:10, price:'$45.00', state:'med', pct:80 }
        ],
        reorder:{
          alertItem:'Parts & Consumables',
          alertDesc:'Parts & Consumables Pack is running low (5 units). You have 2 jobs next week requiring these items.',
          itemName:'Parts & Consumables Pack', qty:20, cost:'$700',
          jobs:[
            { id:'JOB-2851', customer:'Lisa Anderson', date:'Feb 1', jobType:'Repair service',     needs:'3 units' },
            { id:'JOB-2855', customer:'Sarah J.',       date:'Feb 3', jobType:'Maintenance visit',  needs:'2 units' }
          ],
          confirmItem:'Parts & Consumables', confirmQty:'20 packs', confirmCost:'$700.00'
        }
      },
      {
        invoices:[
          { id:'INV-2024-0142', customer:'Emma Davis',    desc:'Service Call + Assessment',    badge:'paid',    date:'Paid Jan 25 · Card ••4872', amount:'$325.00', amountStyle:'color:#16a34a' },
          { id:'INV-2024-0141', customer:'Robert Miller', desc:'Repair & Maintenance',         badge:'overdue', date:'Due Jan 15 · 15 days late', amount:'$310.00', amountStyle:'color:#b91c1c' },
          { id:'INV-2024-0140', customer:'David Brown',   desc:'Installation + Setup',         badge:'pending', date:'Due Feb 2, 2024',           amount:'$240.00', amountStyle:'color:#b45309' }
        ],
        detail:{
          items:[
            { name:'Repair labour (2hr)',    price:'$160.00' },
            { name:'Parts and materials',   price:'$85.00'  },
            { name:'Diagnostic fee',        price:'$45.00'  },
            { name:'Service call fee',      price:'$35.00'  },
            { name:'Tax (8.5%)',            price:'$27.57'  }
          ],
          total:'$352.57'
        }
      },
      {
        products:[
          { name:'Parts & Consumables',   sku:'PARTS-MC', stock:'5 in stock',  price:'$35.00',  qty:2, added:true  },
          { name:'General Supplies Kit',  sku:'SUPP-KIT', stock:'18 in stock', price:'$22.00',  qty:1, added:true  },
          { name:'Equipment Rental (hr)', sku:'EQUIP-HR', stock:'Available',   price:'$45.00',  qty:1, added:false },
          { name:'Service Labour (1hr)',  sku:'LAB-HR',   stock:'Unlimited',   price:'$120.00', qty:1, added:true  }
        ],
        cart:{
          items:[
            { name:'Parts & Consumables',  qty:2, unitPrice:'$35.00',  total:'$70.00'  },
            { name:'General Supplies Kit', qty:1, unitPrice:'$22.00',  total:'$22.00'  },
            { name:'Service Labour (1hr)', qty:1, unitPrice:'$120.00', total:'$120.00' }
          ],
          subtotal:'$212.00', discount:'−$21.20', tax:'$16.22', total:'$207.02'
        }
      },
      {
        techRole:'Service Tech',
        schedule:[
          { time:'9:00 AM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'John Smith',    type:'Service Inspection', address:'123 Main St',   status:'Done ✓',     statusColor:'#22c55e', current:false },
          { time:'10:00 AM · NOW', tech:{ init:'MJ', bg:'#f85520' }, customer:'Emma Davis',    type:'Service Call',       address:'321 Elm St',    status:'In Progress', statusColor:'#f85520', current:true  },
          { time:'11:00 AM',       tech:{ init:'SM', bg:'#f85520' }, customer:'Lisa Anderson', type:'Installation',       address:'135 Spruce Ave',status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'2:00 PM',        tech:{ init:'TW', bg:'#0891b2' }, customer:'Robert Miller', type:'Repair Service',     address:'654 Maple Dr',  status:'Scheduled',   statusColor:'#6b7280', current:false },
          { time:'4:30 PM',        tech:{ init:'MJ', bg:'#f85520' }, customer:'David Brown',   type:'Emergency Call',     address:'246 Birch St',  status:'Scheduled',   statusColor:'#6b7280', current:false }
        ]
      }
    )
  };

}());

/* 'other' is an alias for 'general' */
TOUR_BIZ_DATA.other = TOUR_BIZ_DATA.general;
