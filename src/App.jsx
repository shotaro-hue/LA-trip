import { useState, useEffect, useRef } from "react";

// 画像URLを安全に扱うための最小バリデーション【＝危険なURLスキームを除外】
function sanitizeImageUrl(rawUrl) {
  if (typeof rawUrl !== "string") return "";
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return "";
  try {
    const parsed = new URL(trimmedUrl);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────
// DESIGN TOKENS
//   呼吸する余白: 8 / 14 / 18 の 3 段スペーシング
//   階層を整える: 3 層のサイズスケール（score / sub / meta）
// ─────────────────────────────────────────────────────────
const SP = { xs: 8, sm: 14, md: 18 };
const FS = {
  score:    28, // L1: 一瞬で目に入る数字（順位や勝率のような主役）
  scoreSm:  22, // L1（やや控えめ）
  title:    15, // L2: 見出し・状況
  body:     13, // L2: 本文
  meta:     11, // L3: 補足・メタ情報
  micro:    10, // L3（最小）
};
const C = {
  bg:      "#0d1117",
  surface: "#161b22",
  border:  "#21262d",
  borderHi:"#30363d",
  text:    "#e6edf3",
  muted:   "#8b949e",
  accent:  "#60a5fa",
  ok:      "#34d399",
  warn:    "#fbbf24",
  danger:  "#ef4444",
  purple:  "#c084fc",
};

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const DAYS = [
{
id:"0820", label:"8/20 木", theme:"#60a5fa", icon:"✈️", title:"到着日",
schedule:[
{ time:"12:50", icon:"✈️", title:"LAX着（SQ12）",       note:"入国審査＋荷物で約1.5時間。Uberでオムニへ（約40分）" },
{ time:"15:00", icon:"🏨", title:"Omni LAチェックイン",  note:"部屋に荷物を置いてリフレッシュ" },
{ time:"16:30", icon:"🍴", title:"Grand Central Market", note:"ホテルから徒歩5分。タコス・ラーメン・スシ何でも揃う。初日夕食にぴったり" },
{ time:"20:00", icon:"🛏", title:"就寝",                 note:"時差ボケ対策で早めに。翌日フル観光に備える" },
]
},
{
id:"0821", label:"8/21 金", theme:"#34d399", icon:"🎨", title:"DTLA〜ハリウッド観光",
schedule:[
{ time:"9:00",  icon:"☕", title:"朝食",                         note:"ホテル近隣のカフェ or Grand Central Market" },
{ time:"10:00", icon:"🎨", title:"The Broad",                    note:"⚠️ 事前予約必須（無料）。木曜は20:00まで開館。Jeff KoonsなどポップアートがSNS映え" },
{ time:"12:15", icon:"🚡", title:"Angels Flight",                note:"The Broadから徒歩3分。世界最短ケーブルカー。乗らないと損！" },
{ time:"12:30", icon:"🍴", title:"Grand Central Market ランチ",  note:"Angels Flightを降りて目の前。好きなものをチョイス" },
{ time:"14:30", icon:"⭐", title:"Hollywood Walk of Fame",        note:"Uberで約20分。無料。スター探し・ストリートパフォーマー観覧。約75分" },
{ time:"17:30", icon:"🔭", title:"Griffith Observatory",         note:"Uberで約10分。無料。夕景〜夜景が絶景🌆 ハリウッドサイン・LA夜景一望。22:00まで" },
{ time:"22:00", icon:"🏨", title:"ホテルへ帰宅",                  note:"Uberでオムニへ" },
]
},
{
id:"0822", label:"8/22 土", theme:"#fbbf24", icon:"⚾", title:"サンタモニカ〜ドジャース観戦",
schedule:[
{ time:"9:00",  icon:"☕", title:"朝食",               note:"早めに出発準備。午後はスタジアムなので午前中がメイン観光" },
{ time:"10:00", icon:"🌊", title:"Santa Monica Pier",  note:"Uberで約30分。ビーチ散歩・観覧車。Venice Beachは今日は時間的に見送り" },
{ time:"12:30", icon:"🏨", title:"ホテルへ戻る",       note:"シャワー・着替え・観戦準備。早めに切り上げてOK" },
{ time:"13:30", icon:"🚗", title:"スタジアムへ出発",   note:"Uberで約15分。14:30頃着を目標に余裕を持って出発" },
{ time:"14:30", icon:"🏟", title:"Dodger Stadium着",   note:"プリゲームツアー集合。入場・グラウンド見学など" },
{ time:"15:00", icon:"🎤", title:"プリゲームツアー開始", note:"試合3時間前スタート。グラウンド・ロッカールーム・プレス席など裏側を見学" },
{ time:"17:15", icon:"⚾", title:"観戦席へ着席",       note:"Section 127LG Row K Seats 3,4\nドジャードッグ・ビールを早めに確保！" },
{ time:"18:10", icon:"⚾", title:"Pirates vs Dodgers 試合開始", note:"土曜ナイターは最高の雰囲気！" },
{ time:"21:30", icon:"🚗", title:"試合後・帰宅",       note:"試合後Uberは激混み。少し待ってから配車するのがコツ" },
]
},
{
id:"0823", label:"8/23 日", theme:"#f87171", icon:"🏰", title:"アナハイム移動→ディズニー初日",
schedule:[
{ time:"9:30",  icon:"🚪", title:"Omniチェックアウト",     note:"荷物まとめてUberでアナハイムへ（約1時間）" },
{ time:"11:00", icon:"🏩", title:"Hilton Garden Inn着",    note:"チェックインは15:00〜なので荷物だけ預けてそのままDisneyへ" },
{ time:"12:00", icon:"🏰", title:"Disneyland Park 入園",   note:"📍 本日はDisneyland Park\nCalifornia Adventureは18時閉園のため本日は行かない\n⚠️ チケット＋Lightning Lane事前購入必須！開園23:00まで" },
{ time:"23:00", icon:"🏩", title:"ホテルへ",               note:"徒歩10分。疲れを取ってしっかり休もう" },
]
},
{
id:"0824", label:"8/24 月", theme:"#c084fc", icon:"🎢", title:"California Adventure 終日",
schedule:[
{ time:"7:30", icon:"☕", title:"朝食",                        note:"ホテルで軽く済ませて早めに出発" },
{ time:"8:00", icon:"🎢", title:"California Adventure 開園入場", note:"📍 本日はCalifornia Adventure\n開園と同時入場が鉄則！\n①Radiator Springs Racers\n②Web Slingers\n③Guardians of the Galaxy\nをLightning Laneで先に押さえる" },
{ time:"夜",   icon:"🎆", title:"World of Color（夜の水上ショー）", note:"California Adventureの夜のメインイベント。必見！席取りは早めに" },
{ time:"21:00",icon:"🏩", title:"ホテルへ帰宅",               note:"徒歩で帰れる距離が◎" },
]
},
{
id:"0825", label:"8/25 火", theme:"#fb923c", icon:"🛍", title:"帰国日",
schedule:[
{ time:"9:00",  icon:"🚪", title:"ヒルトンGIチェックアウト",  note:"荷物を持ってDowntown Disneyへ徒歩5分" },
{ time:"9:30",  icon:"🛍", title:"Downtown Disney お土産タイム", note:"入場無料・朝7:00から営業。ディズニーグッズのお土産はここで！重量に注意" },
{ time:"11:30", icon:"🚗", title:"UberでLAXへ出発",           note:"アナハイムからLAXまで約1時間。余裕を持って" },
{ time:"12:30", icon:"✈️", title:"LAX着・チェックイン・出国審査", note:"国際線は2時間前チェックインを推奨" },
{ time:"14:20", icon:"✈️", title:"LAX発（SQ11）",             note:"→ 翌8/26 17:50 成田着" },
]
},
];

const TODOS = [
{ done:false, urgent:true,  text:"ESTA申請（米国入国に必須・渡航72時間前までに）", url:"https://esta.cbp.dhs.gov/", assignee:"👤 Aki", due:"8/17", notify:"72時間前" },
{ done:false, urgent:true,  text:"The Broad 入場予約（無料・要事前予約）",          url:"https://www.thebroad.org/", assignee:"👤 Ken", due:"8/10", notify:"1週間前" },
{ done:true,  urgent:false, text:"ディズニーチケット購入（公式アプリ）",            url:"https://disneyland.disney.go.com/", assignee:"👤 Ken", due:"8/05", notify:"購入後共有" },
{ done:true,  urgent:false, text:"Lightning Lane パス購入（公式ディズニーアプリ）", url:"https://disneyland.disney.go.com/", assignee:"👤 Ken", due:"8/16", notify:"前日" },
{ done:true,  urgent:false, text:"ドジャース プリゲームツアー購入（15:00〜）",      url:"https://www.mlb.com/dodgers/ballpark/tours", assignee:"👤 Ken", due:"8/08", notify:"購入後共有" },
{ done:false, urgent:false, text:"旅行保険（クレカ付帯保険の補償内容確認）",        url:"", assignee:"👤 Aki", due:"8/14", notify:"3日前" },
{ done:true,  urgent:false, text:"SQ フライト予約（往復プレエコ）",                url:"", assignee:"👤 Aki", due:"完了", notify:"完了" },
{ done:true,  urgent:false, text:"Omni LA 予約（8/20-23 ¥134,640）",             url:"", assignee:"👤 Aki", due:"完了", notify:"完了" },
{ done:true,  urgent:false, text:"Hilton GI Anaheim 予約（8/23-25 ¥67,996）",   url:"", assignee:"👤 Aki", due:"完了", notify:"完了" },
{ done:true,  urgent:false, text:"ドジャース観戦チケット購入（Section 127LG Row K）", url:"", assignee:"👤 Ken", due:"完了", notify:"完了" },
];

const RESERVATIONS = [
{ label:"SQ 往路", value:"SQ12 / 8-20 12:50 LAX着" },
{ label:"SQ 復路", value:"SQ11 / 8-25 14:20 LAX発" },
{ label:"Omni LA", value:"8/20-8/23・予約確認番号: OMLA-8242" },
{ label:"Hilton GI", value:"8/23-8/25・予約確認番号: HGI-2391" },
{ label:"Dodgers", value:"Sec127LG RowK Seat3-4" },
];

const COSTS = [
{ cat:"✈️ フライト（支払済）", item:"SQ プレエコ 往復（2名）",                  jpy: 480280 },
{ cat:"🏨 ホテル",             item:"Omni LA（3泊）",                          jpy: 134640 },
{ cat:"🏨 ホテル",             item:"Hilton GI Anaheim（2泊）",                jpy:  67996 },
{ cat:"⚾ チケット",           item:"ドジャース観戦（2名）",                     usd: 530.20 },
{ cat:"⚾ ツアー",             item:"プリゲームツアー（2名）",                   jpy: 50172 },
{ cat:"🏰 Disney",            item:"チケット＋Lightning Lane 2日分（2名）",     jpy: 118435 },
];

const SAFETY_SPOTS = [
{ spot:"LAX・アナハイム・Disney", color:"#22c55e", mark:"◎ 安全" },
{ spot:"Santa Monica Pier",       color:"#22c55e", mark:"◎ 安全" },
{ spot:"Beverly Hills・Griffith", color:"#22c55e", mark:"◎ 安全" },
{ spot:"DTLA（昼）",              color:"#22c55e", mark:"○ ほぼ問題なし" },
{ spot:"Hollywood Walk（昼）",    color:"#fbbf24", mark:"△ スリ注意" },
{ spot:"Venice Beach（昼）",      color:"#fbbf24", mark:"△ スリ注意" },
{ spot:"DTLA（夜・試合後）",      color:"#fbbf24", mark:"△ 2人行動で" },
{ spot:"Skid Row周辺",            color:"#ef4444", mark:"✕ 絶対立入禁止" },
];

// ─────────────────────────────────────────────────────────
// MAP DATA（地図タブ用）
// ─────────────────────────────────────────────────────────
const MAP_DAYS = {
"0820":{ col:"#60a5fa", em:"✈️", lbl:"8/20" },
"0821":{ col:"#34d399", em:"🎭", lbl:"8/21" },
"0822":{ col:"#fbbf24", em:"🌊", lbl:"8/22" },
"0823":{ col:"#f87171", em:"🏰", lbl:"8/23" },
"0824":{ col:"#c084fc", em:"🎢", lbl:"8/24" },
"0825":{ col:"#fb923c", em:"✈️", lbl:"8/25" },
};

const MAP_SPOTS = [
{ d:"0820", n:"LAX 国際空港",           lat:33.9425, lng:-118.4081, em:"✈️", desc:"12:50着 SQ12 成田→LAX" },
{ d:"0820", n:"Omni Los Angeles",        lat:34.0526, lng:-118.2506, em:"🏨", desc:"15:00〜 チェックイン\n8/20–23 3泊 ¥134,640" },
{ d:"0820", n:"Grand Central Market",    lat:34.0509, lng:-118.2491, em:"🍴", desc:"16:30〜 初日夕食" },
{ d:"0821", n:"Omni（2泊目）",           lat:34.0526, lng:-118.2506, em:"🏨", desc:"本日の宿泊先 Omni LA" },
{ d:"0821", n:"Olvera Street",           lat:34.0576, lng:-118.2379, em:"🌮", desc:"9:00〜 LAで最も古い歴史的通り" },
{ d:"0821", n:"Angels Flight",           lat:34.0516, lng:-118.2506, em:"🚡", desc:"10:00〜 $1.50の世界最短ケーブルカー" },
{ d:"0821", n:"Hollywood Walk of Fame",  lat:34.1016, lng:-118.3296, em:"⭐", desc:"13:00〜 無料 スター探し散策" },
{ d:"0821", n:"Griffith Observatory",    lat:34.1184, lng:-118.3004, em:"🔭", desc:"15:00〜 無料 夕景〜夜景が絶景" },
{ d:"0822", n:"Omni（3泊目）",           lat:34.0526, lng:-118.2506, em:"🏨", desc:"本日の宿泊先 Omni LA" },
{ d:"0822", n:"Santa Monica Pier",       lat:34.0083, lng:-118.4988, em:"🌊", desc:"10:00〜 ビーチ散歩・観覧車\n12:30撤収→ホテルへ" },
{ d:"0822", n:"Dodger Stadium",          lat:34.0739, lng:-118.2400, em:"⚾", desc:"13:30出発・14:30着\n15:00〜 プリゲームツアー\n18:10 Pirates vs Dodgers\nSection 127LG Row K Seats 3–4" },
{ d:"0823", n:"Omni チェックアウト",      lat:34.0536, lng:-118.2516, em:"🚪", desc:"9:30 チェックアウト → アナハイムへ" },
{ d:"0823", n:"Hilton Garden Inn Anaheim",lat:33.8117,lng:-117.9123, em:"🏩", desc:"11:00〜 チェックイン\n8/23–25 2泊 ¥67,996" },
{ d:"0823", n:"Disneyland Park",         lat:33.8121, lng:-117.9190, em:"🏰", desc:"12:00〜 ⚠️ Lightning Lane事前購入必須！" },
{ d:"0824", n:"Hilton（2泊目）",          lat:33.8117, lng:-117.9123, em:"🏩", desc:"本日の宿泊先 Hilton Garden Inn" },
{ d:"0824", n:"California Adventure",    lat:33.8062, lng:-117.9199, em:"🎢", desc:"8:00〜 開園同時入場！\nRadiator Springs Racers最優先" },
{ d:"0825", n:"Hilton チェックアウト",    lat:33.8117, lng:-117.9123, em:"🏩", desc:"チェックアウト後 Downtown Disney経由LAXへ" },
{ d:"0825", n:"Downtown Disney",         lat:33.8098, lng:-117.9238, em:"🛍", desc:"9:30〜 入場無料 お土産タイム" },
{ d:"0825", n:"LAX（帰）",               lat:33.9435, lng:-118.4071, em:"✈️", desc:"14:20発 SQ11 → 翌8/26 17:50 成田着" },
{ d:"cand",  n:"Rodeo Drive",            lat:34.0678, lng:-118.4016, em:"💎", desc:"追加候補 グリフィス帰りUber15分" },
];

const MAP_ROUTES = [
{ d:"0820", segs:[
{ wp:[[33.9425,-118.4081],[34.0526,-118.2506]], mode:"🚗 Uber",  time:"約35分", label:"LAX → Omni" },
{ wp:[[34.0526,-118.2506],[34.0509,-118.2491]], mode:"🚶 徒歩",  time:"約3分",  label:"Omni → Grand Central Market" },
]},
{ d:"0821", segs:[
{ wp:[[34.0526,-118.2506],[34.0576,-118.2379]], mode:"🚶 徒歩",  time:"約15分", label:"Omni → Olvera Street" },
{ wp:[[34.0576,-118.2379],[34.0516,-118.2506]], mode:"🚶 徒歩",  time:"約12分", label:"Olvera Street → Angels Flight" },
{ wp:[[34.0516,-118.2506],[34.0509,-118.2491]], mode:"🚡+🚶",   time:"約5分",  label:"Angels Flight → Grand Central" },
{ wp:[[34.0509,-118.2491],[34.1016,-118.3296]], mode:"🚗 Uber",  time:"約20分", label:"Grand Central → Hollywood" },
{ wp:[[34.1016,-118.3296],[34.1184,-118.3004]], mode:"🚗 Uber",  time:"約15分", label:"Hollywood → Griffith" },
{ wp:[[34.1184,-118.3004],[34.0526,-118.2506]], mode:"🚗 Uber",  time:"約25分", label:"Griffith → Omni" },
]},
{ d:"0822", segs:[
{ wp:[[34.0526,-118.2506],[34.0083,-118.4988]], mode:"🚗 Uber",  time:"約30分", label:"Omni → Santa Monica Pier" },
{ wp:[[34.0083,-118.4988],[34.0526,-118.2506]], mode:"🚗 Uber",  time:"約30分", label:"Santa Monica → Omni（12:30撤収）" },
{ wp:[[34.0526,-118.2506],[34.0739,-118.2400]], mode:"🚗 Uber",  time:"約15分", label:"Omni → Dodger Stadium（13:30出発）" },
{ wp:[[34.0739,-118.2400],[34.0526,-118.2506]], mode:"🚗 Uber",  time:"約15分", label:"Dodger Stadium → Omni" },
]},
{ d:"0823", segs:[
{ wp:[[34.0526,-118.2506],[33.8117,-117.9123]], mode:"🚗 Uber",  time:"約50〜60分", label:"Omni → Hilton Anaheim" },
{ wp:[[33.8117,-117.9123],[33.8121,-117.9190]], mode:"🚶 徒歩",  time:"約5分",  label:"Hilton → Disneyland" },
]},
{ d:"0824", segs:[
{ wp:[[33.8117,-117.9123],[33.8062,-117.9199]], mode:"🚶 徒歩",  time:"約10分", label:"Hilton → California Adventure" },
{ wp:[[33.8062,-117.9199],[33.8117,-117.9123]], mode:"🚶 徒歩",  time:"約10分", label:"California Adventure → Hilton" },
]},
{ d:"0825", segs:[
{ wp:[[33.8117,-117.9123],[33.8098,-117.9238]], mode:"🚶 徒歩",  time:"約8分",  label:"Hilton → Downtown Disney" },
{ wp:[[33.8098,-117.9238],[33.9425,-118.4081]], mode:"🚗 Uber",  time:"約40〜50分", label:"Downtown Disney → LAX" },
]},
];



function SmartImage({ imageUrl, altText, onZoom }) {
  const safeImageUrl = sanitizeImageUrl(imageUrl);
  const [loadError, setLoadError] = useState(false);

  // ⚠️ 検索キーワードの無害化【＝危険な文字列混入を防ぐ】
  const safeKeyword = typeof altText === "string" ? altText.trim().slice(0, 120) : "";
  const encodedKeyword = encodeURIComponent(safeKeyword);
  const googleSearchUrl = encodedKeyword ? `https://www.google.com/search?tbm=isch&q=${encodedKeyword}` : "";
  const instagramSearchUrl = encodedKeyword ? `https://www.instagram.com/explore/tags/${encodedKeyword.replace(/%20/g, "")}/` : "";

  if (!safeImageUrl || loadError) {
    return (
      <div style={{ minHeight:120, background:"#111827", borderBottom:"1px solid #30363d", color:"#8b949e", fontSize:11, padding:"10px", textAlign:"center" }}>
        <div style={{ marginBottom:8 }}>画像を表示できませんでした（通信状況をご確認ください）</div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {googleSearchUrl ? (
            <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:"#60a5fa", border:"1px solid #60a5fa66", borderRadius:6, padding:"4px 8px", textDecoration:"none" }}>
              Google画像で探す
            </a>
          ) : null}
          {instagramSearchUrl ? (
            <a href={instagramSearchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:"#c084fc", border:"1px solid #c084fc66", borderRadius:6, padding:"4px 8px", textDecoration:"none" }}>
              Instagramで探す
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onZoom}
      style={{ padding:0, border:"none", width:"100%", background:"transparent", cursor:"zoom-in" }}
      aria-label={`${altText} の画像を拡大表示`}
    >
      <img
        src={safeImageUrl}
        alt={altText}
        style={{ width:"100%", height:120, objectFit:"cover", display:"block" }}
        onError={() => setLoadError(true)}
      />
    </button>
  );
}

const DANGER_ZONES = [
{ c:[[34.0518,-118.2430],[34.0518,-118.2228],[34.0408,-118.2228],[34.0408,-118.2430]], t:"⛔ Skid Row｜全米最大ホームレス密集地\n暴力犯罪・薬物蔓延。絶対立入禁止" },
{ c:[[34.0640,-118.2820],[34.0640,-118.2700],[34.0520,-118.2700],[34.0520,-118.2820]], t:"⛔ Westlake/MacArthur Park｜薬物売買・強盗多発" },
{ c:[[33.9570,-118.2580],[33.9570,-118.2335],[33.9235,-118.2335],[33.9235,-118.2580]], t:"⛔ Watts｜ギャング抗争・暴力犯罪 全米平均367%" },
{ c:[[33.9235,-118.2580],[33.9235,-118.1870],[33.8680,-118.1870],[33.8680,-118.2580]], t:"⛔ Compton｜殺人率 全米平均3倍以上" },
{ c:[[34.0480,-118.2270],[34.0480,-118.1730],[34.0220,-118.1730],[34.0220,-118.2270]], t:"⛔ Boyle Heights/East LA｜ギャング縄張り・銃撃事件" },
];

// ─────────────────────────────────────────────────────────
// MAP COMPONENT
// ─────────────────────────────────────────────────────────
function MapView() {
const mapRef = useRef(null);
const mapInstanceRef = useRef(null);
const layersRef = useRef({ spots:{}, routes:{} });
const dangerLayerRef = useRef(null);
const [activeDay, setActiveDay] = useState("all");
const [mapReady, setMapReady] = useState(false);
const [showSafety, setShowSafety] = useState(false);

const dayKeys = ["0820","0821","0822","0823","0824","0825","cand"];

useEffect(() => {
if (mapInstanceRef.current) return;

// Load Leaflet CSS
const existingCss = document.getElementById("leaflet-css");
if (!existingCss) {
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
  document.head.appendChild(link);
}

// Load Leaflet JS
if (window.L) { initMap(); return; }
const script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
script.onload = initMap;
document.head.appendChild(script);

function initMap() {
  if (!mapRef.current || mapInstanceRef.current) return;
  const L = window.L;

  const map = L.map(mapRef.current, { center:[34.02,-118.30], zoom:11, preferCanvas:true });
  mapInstanceRef.current = map;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom:18, subdomains:"abc"
  }).addTo(map);

  // Danger zones — layerGroupにまとめてrefに保持（デフォルトOFF）
  const dangerGroup = L.layerGroup();
  DANGER_ZONES.forEach(z => {
    L.polygon(z.c, { color:"#ef4444", fillColor:"#ef4444", fillOpacity:0.22, weight:2, dashArray:"5,4" })
     .bindTooltip(z.t.replace(/\n/g," "), { sticky:true, direction:"top" })
     .addTo(dangerGroup);
  });
  dangerLayerRef.current = dangerGroup;
  // 初期状態はOFFなのでmapには追加しない

  // Spot layer groups
  const lGroups = {};
  dayKeys.forEach(k => { lGroups[k] = L.layerGroup(); });

  function hexRgba(h, a) {
    const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  MAP_SPOTS.forEach(s => {
    const isCand = s.d === "cand";
    const info = isCand ? {col:"#c084fc"} : MAP_DAYS[s.d];
    const bg = isCand ? "rgba(192,132,252,0.15)" : hexRgba(info.col, 0.2);
    const bd = isCand ? "2px dashed #c084fc" : `2.5px solid ${info.col}`;
    const icon = L.divIcon({
      html:`<div style="width:32px;height:40px;display:flex;align-items:flex-start;justify-content:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5))"><div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:${bd};display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:14px;line-height:1">${s.em}</span></div></div>`,
      className:"", iconSize:[32,40], iconAnchor:[16,40], popupAnchor:[0,-42]
    });
    const dayInfo = isCand ? {em:"📍", lbl:"追加候補", col:"#c084fc"} : MAP_DAYS[s.d];
    const marker = L.marker([s.lat, s.lng], {icon});
    marker.bindPopup(
      `<div style="padding:10px 12px;min-width:170px;max-width:240px;font-family:sans-serif">` +
      `<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${dayInfo.col};margin-bottom:3px">${dayInfo.em} ${dayInfo.lbl}</div>` +
      `<div style="font-size:13px;font-weight:700;color:#e6edf3;margin-bottom:4px">${s.n}</div>` +
      `<div style="font-size:11px;color:#8b949e;line-height:1.5">${s.desc.replace(/\n/g,"<br>")}</div>` +
      `</div>`
    );
    marker.addTo(lGroups[s.d]);
  });

  // Route layer groups
  const rLayers = {};
  MAP_ROUTES.forEach(r => {
    rLayers[r.d] = L.layerGroup();
    const col = MAP_DAYS[r.d].col;
    r.segs.forEach(seg => {
      const line = L.polyline(seg.wp, { color:col, weight:4, opacity:0.85, lineCap:"round", lineJoin:"round" });
      line.bindPopup(
        `<div style="padding:10px 12px;font-family:sans-serif;min-width:150px">` +
        `<div style="font-size:10px;font-weight:700;color:${col};text-transform:uppercase;margin-bottom:3px">${MAP_DAYS[r.d].em} ${MAP_DAYS[r.d].lbl}</div>` +
        `<div style="font-size:12px;font-weight:700;color:#e6edf3;margin-bottom:5px">${seg.label}</div>` +
        `<div style="font-size:20px;margin-bottom:2px">${seg.mode.split(" ")[0]}</div>` +
        `<div style="font-size:14px;font-weight:700;color:${col}">${seg.time}</div>` +
        `<div style="font-size:11px;color:#8b949e">${seg.mode}</div>` +
        `</div>`
      );
      line.addTo(rLayers[r.d]);
    });
  });

  layersRef.current = { lGroups, rLayers };
  setMapReady(true);

  // Show all on init
  dayKeys.forEach(k => lGroups[k].addTo(map));
  Object.keys(rLayers).forEach(k => rLayers[k].addTo(map));

  setTimeout(() => map.invalidateSize(), 100);
}

}, []);

// 治安レイヤー ON/OFF
useEffect(() => {
if (!mapReady || !mapInstanceRef.current || !dangerLayerRef.current) return;
const map = mapInstanceRef.current;
if (showSafety) {
dangerLayerRef.current.addTo(map);
} else {
if (map.hasLayer(dangerLayerRef.current)) map.removeLayer(dangerLayerRef.current);
}
}, [showSafety, mapReady]);

// Day switching
useEffect(() => {
if (!mapReady || !mapInstanceRef.current) return;
const map = mapInstanceRef.current;
const { lGroups, rLayers } = layersRef.current;
if (!lGroups) return;

dayKeys.forEach(k => { if (map.hasLayer(lGroups[k])) map.removeLayer(lGroups[k]); });
Object.keys(rLayers).forEach(k => { if (map.hasLayer(rLayers[k])) map.removeLayer(rLayers[k]); });

const L = window.L;
if (activeDay === "all") {
  dayKeys.forEach(k => lGroups[k].addTo(map));
  Object.keys(rLayers).forEach(k => rLayers[k].addTo(map));
  map.setView([34.02,-118.30], 11, {animate:true});
} else {
  lGroups[activeDay].addTo(map);
  lGroups["cand"].addTo(map);
  if (rLayers[activeDay]) rLayers[activeDay].addTo(map);
  const pts = MAP_SPOTS.filter(s => s.d === activeDay).map(s => [s.lat, s.lng]);
  if (pts.length > 0) {
    map.fitBounds(L.latLngBounds(pts), { padding:[55,55], maxZoom:14, animate:true });
  }
}

}, [activeDay, mapReady]);

const tabDays = [
{ id:"all",  label:"ALL",  col:"#94a3b8" },
{ id:"0820", label:"8/20", col:"#60a5fa" },
{ id:"0821", label:"8/21", col:"#34d399" },
{ id:"0822", label:"8/22", col:"#fbbf24" },
{ id:"0823", label:"8/23", col:"#f87171" },
{ id:"0824", label:"8/24", col:"#c084fc" },
{ id:"0825", label:"8/25", col:"#fb923c" },
];

return (
<div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
{/* Day tabs */}
<div style={{ display:"flex", gap:2, overflowX:"auto", padding:"8px 10px 0", background:"#161b22", borderBottom:"1px solid #21262d", scrollbarWidth:"none" }}>
{tabDays.map(t => (
<button key={t.id} onClick={() => setActiveDay(t.id)} style={{
flexShrink:0, padding:"5px 11px", borderRadius:"6px 6px 0 0",
background: activeDay===t.id ? "#0d1117" : "#21262d",
color: activeDay===t.id ? t.col : "#8b949e",
border: activeDay===t.id ? `1px solid #30363d` : "1px solid transparent",
borderBottom: activeDay===t.id ? "1px solid #0d1117" : "1px solid transparent",
borderTop: activeDay===t.id ? `2px solid ${t.col}` : "2px solid transparent",
fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
WebkitTapHighlightColor:"transparent",
}}>{t.label}</button>
))}
</div>

  {/* ツールバー：治安トグル＋凡例 */}
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 12px", background:"#0d1117", borderBottom:"1px solid #21262d" }}>
    <span style={{ fontSize:10, color:"#8b949e" }}>ルートをタップ → 所要時間</span>
    <button
      onClick={() => setShowSafety(v => !v)}
      style={{
        display:"flex", alignItems:"center", gap:5,
        padding:"4px 10px", borderRadius:20,
        background: showSafety ? "rgba(239,68,68,0.15)" : "#21262d",
        border: showSafety ? "1px solid #ef444488" : "1px solid #30363d",
        color: showSafety ? "#ef4444" : "#8b949e",
        fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
        WebkitTapHighlightColor:"transparent",
        transition:"all 0.2s",
      }}
    >
      <span style={{ fontSize:10 }}>{showSafety ? "🔴" : "⭕"}</span>
      危険エリア {showSafety ? "ON" : "OFF"}
    </button>
  </div>

  {/* Map */}
  <div ref={mapRef} style={{ flex:1, minHeight:0 }} />
</div>

);
}

// ─────────────────────────────────────────────────────────
// GOURMET & GOODS DATA
// ─────────────────────────────────────────────────────────
const GOURMET = [
{
category:"🍳 朝食・ブランチ",
items:[
{
name:"Eggslut（エッグスラット）",
location:"Grand Central Market・DTLA",
price:"$10〜15",
tag:"LAの朝食定番",
tagColor:"#34d399",
desc:"2011年創業のエッグサンド専門店。ブリオッシュバンに柔らかスクランブルエッグ＋チーズの「Fairfax」が絶品。行列必至なので開店直後（8時〜）に狙うのがコツ。",
img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Grand_Central_Market%2C_Los_Angeles_%282014%29.jpg/320px-Grand_Central_Market%2C_Los_Angeles_%282014%29.jpg",
days:["8/20","8/21"],
must:true,
},
{
name:"Langer's Deli",
location:"MacArthur Park近く（Uber10分）",
price:"$18〜25",
tag:"LA最強パストラミ",
tagColor:"#fbbf24",
desc:"1947年創業の老舗デリ。#19のパストラミサンドは「NYのカッツより旨い」と言われるほど。分厚い肉とライ麦パンのコンボ。月〜土のみ営業（要注意）。",
img:"",
days:["8/21"],
must:false,
},
]
},
{
category:"🌮 タコス・メキシカン",
items:[
{
name:"Grand Central Market タコス",
location:"DTLA・ホテル徒歩5分",
price:"$4〜8/枚",
tag:"旅程直結",
tagColor:"#60a5fa",
desc:"1917年創業の歴史的フードホール。「Tacos Tumbras a Tomas」のバーベキュータコスや「Sarita's Pupuseria」のエルサルバドル料理など40店舗以上が集結。初日夕食・翌日ランチ両方で使える。",
img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Grand_Central_Market_-_Los_Angeles.jpg/320px-Grand_Central_Market_-_Los_Angeles.jpg",
days:["8/20","8/21"],
must:true,
},
{
name:"Venice Beach フィッシュタコス",
location:"Venice Beach ボードウォーク屋台",
price:"$3〜5/枚",
tag:"絶品ローカルフード",
tagColor:"#34d399",
desc:"ボードウォーク沿いの屋台で食べるフィッシュタコスは格別。バスケットコート近くの屋台が評判◎。$3〜5で本格的なバハスタイルを堪能できる。",
img:"",
days:["8/22"],
must:false,
},
]
},
{
category:"🌭 スタジアムグルメ",
items:[
{
name:"Dodger Dog（ドジャードッグ）",
location:"Dodger Stadium・スタジアム内",
price:"$7〜9",
tag:"絶対食べるべき",
tagColor:"#ef4444",
desc:"1958年から続くスタジアムの象徴。30cmの巨大ホットドッグで年間200万本以上売れる。スチームかグリルか選べる。グリル版がサクサクで旨い。ビールとセットで$20前後。",
img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Dodger_Stadium_field_from_the_loge_level.jpg/320px-Dodger_Stadium_field_from_the_loge_level.jpg",
days:["8/22"],
must:true,
},
]
},
{
category:"🍔 バーガー",
items:[
{
name:"In-N-Out Burger（インアンドアウト）",
location:"LAX近く・市内複数店舗",
price:"$5〜10",
tag:"西海岸限定",
tagColor:"#fbbf24",
desc:"西海岸でしか食べられないカリフォルニア発の国民的バーガー。必ず「Animal Style（アニマルスタイル）」を注文。グリルドオニオン＋特製ソースが絶品。帰りにLAX近くの店舗で食べるのが定番。",
img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/In-N-Out_Burger_hamburger_and_fries.jpg/320px-In-N-Out_Burger_hamburger_and_fries.jpg",
days:["8/25"],
must:true,
},
]
},
{
category:"🌭 ホットドッグ",
items:[
{
name:"Pink's Hot Dogs（ピンクス）",
location:"Hollywood Blvd近く",
price:"$8〜12",
tag:"1939年創業の聖地",
tagColor:"#c084fc",
desc:"創業1939年のLA名物ホットドッグ店。セレブも通う老舗で深夜も営業。チリドッグ（$7〜）が看板メニュー。Hollywood観光のついでに立ち寄れる。並ぶ価値あり。",
img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Pink%27s_Hot_Dogs%2C_Los_Angeles.jpg/320px-Pink%27s_Hot_Dogs%2C_Los_Angeles.jpg",
days:["8/21"],
must:false,
},
]
},
{
category:"☕ カフェ・スイーツ",
items:[
{
name:"Maru Coffee（マルコーヒー）",
location:"Arts District・DTLA",
price:"$6〜9",
tag:"ビーバー夫妻も通う",
tagColor:"#34d399",
desc:"Glassel Parkで自家焙煎したこだわりコーヒー。エスプレッソトニックやアイス抹茶ラテが話題。Justin Bieberも常連で知られる。Omniから徒歩15分のArts Districtにあり。",
img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/320px-A_small_cup_of_coffee.JPG",
days:["8/21"],
must:false,
},
]
},
];

const GOODS = [
{
category:"⚾ ドジャースグッズ",
must:true,
items:[
{ name:"Dodgersキャップ（New Era 59Fifty）", price:"$38〜45", where:"Dodger Stadium・Downtown Disney", desc:"LAの象徴。本場のオフィシャルキャップはお土産の王道。試合当日スタジアムショップで買うのが一番盛り上がる。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Los_Angeles_Dodgers_Cap_Insignia.svg/320px-Los_Angeles_Dodgers_Cap_Insignia.svg.png" },
{ name:"大谷翔平 ユニフォーム #17", price:"$120〜180", where:"Dodger Stadium", desc:"本場ドジャースタジアムで購入した大谷ユニは最高の記念品。レプリカ（$50〜）でもテンション上がる。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Shohei_Ohtani_%2851930056529%29_%28cropped%29.jpg/320px-Shohei_Ohtani_%2851930056529%29_%28cropped%29.jpg" },
{ name:"ドジャードッグ グッズ", price:"$15〜30", where:"Dodger Stadium", desc:"ドジャードッグをモチーフにしたTシャツやぬいぐるみも人気。スタジアムショップで探してみて。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Hot_dog_with_mustard.png/320px-Hot_dog_with_mustard.png" },
]
},
{
category:"🏰 ディズニーグッズ",
must:true,
items:[
{ name:"ミッキーイヤーハット", price:"$30〜40", where:"Disneyland Park・Downtown Disney", desc:"ディズニーの定番お土産。名前入りにカスタマイズできる（+$10）。種類が豊富なのでお気に入りを探して。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Mickey_Mouse_head_and_ears.svg/320px-Mickey_Mouse_head_and_ears.svg.png" },
{ name:"限定スプーフィー", price:"$20〜25", where:"Disneyland Park", desc:"ディズニーランド限定のステッカーパック。荷物が軽くて安いのでお土産に最適。" },
{ name:"パーク限定フード（ミッキーワッフル等）", price:"$8〜12", where:"Disneyland Park内各所", desc:"ミッキー型のワッフルやプレッツェルはパーク内でしか食べられない体験型グルメ。写真映えも◎。" },
]
},
{
category:"🌴 LAローカルブランド",
must:false,
items:[
{ name:"Madhappy スウェット", price:"$120〜180", where:"Fairfax Ave・公式サイト", desc:"LAを代表するストリートブランド。ポジティブなメッセージと落ち着いたカラーが人気。Fairfax Aveの店舗で限定カラーも。" },
{ name:"Free & Easy Tシャツ", price:"$40〜60", where:"Venice周辺", desc:"ベニスのサーファーカルチャーを体現したブランド。「Don't trip」のグラフィックTがアイコニック。" },
]
},
{
category:"🎁 ばらまき土産",
must:false,
items:[
{ name:"In-N-Out Burger ステッカー・Tシャツ", price:"$5〜20", where:"In-N-Out各店", desc:"In-N-Outのオフィシャルグッズはレア度が高くて喜ばれる。Tシャツ・ステッカー・トートなど種類豊富。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/In-N-Out_Burger_hamburger_and_fries.jpg/320px-In-N-Out_Burger_hamburger_and_fries.jpg" },
{ name:"Griffith Observatory グッズ", price:"$10〜30", where:"Griffith Observatory ギフトショップ", desc:"星座モチーフのマグカップやTシャツ。「行ったよ」感が伝わるLAらしいお土産。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Griffith_Observatory_%28Los_Angeles%29_2012.jpg/320px-Griffith_Observatory_%28Los_Angeles%29_2012.jpg" },
{ name:"Venice Beach ブレスレット", price:"$2〜5/本", where:"Venice Boardwalk", desc:"ボードウォークの屋台で売っているカラフルなブレスレット。2本$5が相場。女友達へのプチギフトに最適。", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Venice_Beach_boardwalk.jpg/320px-Venice_Beach_boardwalk.jpg" },
]
},
];

// ─────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────
const TABS = [
{ label:"📅 日程",  id:"schedule" },
{ label:"🗺 地図",  id:"map" },
{ label:"🏰 Disney", id:"disney" },
{ label:"🍴 グルメ", id:"gourmet" },
{ label:"🛍 グッズ", id:"goods" },
{ label:"💴 費用",  id:"cost" },
{ label:"🛡 治安",  id:"safety" },
{ label:"✅ ToDo", id:"todo" },
];

export default function App() {
const [tab, setTab]       = useState("schedule");
const [openDay, setOpenDay] = useState(null);
const [todos, setTodos]   = useState(TODOS);
const [disneySubTab, setDisneySubTab] = useState("ll");
const [tripMode, setTripMode] = useState("before");
const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
const [assigneeFilter, setAssigneeFilter] = useState("all");
const [usdJpy, setUsdJpy] = useState(null);
const [selectedImage, setSelectedImage] = useState({ url:"", alt:"" });

useEffect(() => {
  fetch('https://open.er-api.com/v6/latest/USD')
    .then(r => r.json())
    .then(d => { if (d.result === 'success') setUsdJpy(Math.round(d.rates.JPY)); })
    .catch(() => {});
}, []);

const undoneUrgent = todos.filter(t => !t.done && t.urgent).length;
const undoneTotal  = todos.filter(t => !t.done).length;
const doneCount    = todos.filter(t => t.done).length;
const completionPct = Math.round((doneCount / todos.length) * 100);
const urgentTodos   = todos.filter(t => !t.done && t.urgent);
const upcomingAction = DAYS[0]?.schedule?.[0];
const nextTodo = todos.find(t => !t.done);
const assignees = ["all", ...new Set(todos.map(t => t.assignee))];
const visibleTodos = todos.filter(t => {
  if (showIncompleteOnly && t.done) return false;
  if (assigneeFilter !== "all" && t.assignee !== assigneeFilter) return false;
  return true;
});

// 出発日 8/20 までのカウントダウン（年は環境依存のため当日 0 を保証）
const departure = new Date("2026-08-20T00:00:00+09:00");
const today = new Date();
const daysToGo = Math.max(0, Math.ceil((departure - today) / 86400000));
const tripPhase = daysToGo > 0 ? "出発前" : (daysToGo === 0 ? "出発当日" : "旅行中");

return (
<div style={{ fontFamily:"-apple-system,'Hiragino Sans','Yu Gothic',sans-serif", background:"#0d1117", height:"100vh", color:"#e6edf3", display:"flex", flexDirection:"column", maxWidth:540, margin:"0 auto" }}>

  {/* Header — 3層階層: タイトル(L3) / カウントダウン(L1=score) / メタ(L3) */}
  <div style={{ background:"linear-gradient(135deg,#1c2e4a 0%,#0d1117 100%)", padding:`${SP.sm}px ${SP.md}px ${SP.sm}px`, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:SP.sm }}>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:FS.meta, color:C.muted, letterSpacing:1, fontWeight:700 }}>🌴 LA TRIP 2026</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:SP.xs, marginTop:2 }}>
          <span style={{ fontSize:FS.score, fontWeight:800, lineHeight:1, background:"linear-gradient(90deg,#60a5fa,#c084fc,#fb923c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {daysToGo}
          </span>
          <span style={{ fontSize:FS.body, color:C.muted, fontWeight:700 }}>日</span>
          <span style={{ fontSize:FS.meta, color:C.muted, marginLeft:SP.xs }}>{tripPhase}</span>
        </div>
        <div style={{ fontSize:FS.meta, color:C.muted, marginTop:2 }}>8/20（木）〜 8/25（火）｜2名｜SQ プレエコ</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end", flexShrink:0 }}>
        {[
          { id:"before", label:"旅行前" },
          { id:"during", label:"旅行中" },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setTripMode(mode.id)}
            style={{
              borderRadius:999, border:`1px solid ${C.borderHi}`, padding:"4px 10px",
              background: tripMode===mode.id ? "#60a5fa22" : C.surface,
              color: tripMode===mode.id ? C.accent : C.muted,
              fontSize:FS.micro, fontWeight:700, fontFamily:"inherit", cursor:"pointer",
              minWidth:64, WebkitTapHighlightColor:"transparent",
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Tab bar */}
  <div style={{ display:"flex", background:C.surface, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{
        flex:1, padding:`${SP.sm-4}px 2px`, fontSize:FS.meta, border:"none", cursor:"pointer",
        background: tab===t.id ? "#21262d" : "transparent",
        color: tab===t.id ? C.accent : C.muted,
        borderBottom: tab===t.id ? `2px solid ${C.accent}` : "2px solid transparent",
        fontFamily:"inherit", fontWeight: tab===t.id ? 700 : 400,
        position:"relative", WebkitTapHighlightColor:"transparent",
      }}>
        {t.label}
        {t.id==="todo" && undoneUrgent > 0 && (
          <span style={{ position:"absolute", top:6, right:6, background:C.danger, borderRadius:"50%", width:8, height:8, display:"inline-block" }}/>
        )}
      </button>
    ))}
  </div>

  {/* Content */}
  <div style={{ flex:1, minHeight:0, overflowY: tab==="map" ? "hidden" : "auto", padding: tab==="map" ? 0 : `${SP.sm}px ${SP.sm}px ${SP.md*2}px` }}>
    {/* ─── ホーム（日程タブ）：スコア → 状況 → 対戦 → 操作 を縦に並べる ─── */}
    {tab === "schedule" && (
      <>
        {/* L1: スコア — 完了率と急ぎ件数を 3 層スケールで一瞬把握 */}
        <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:`${SP.sm}px ${SP.md}px`, marginBottom:SP.sm, display:"flex", gap:SP.md, alignItems:"stretch" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:FS.meta, color:C.muted, fontWeight:700, letterSpacing:0.5 }}>準備の進捗</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:SP.xs, marginTop:4 }}>
              <span style={{ fontSize:FS.score, fontWeight:800, color: completionPct===100 ? C.ok : C.accent, lineHeight:1 }}>{completionPct}</span>
              <span style={{ fontSize:FS.body, color:C.muted, fontWeight:700 }}>%</span>
              <span style={{ fontSize:FS.meta, color:C.muted, marginLeft:SP.xs }}>{doneCount}/{todos.length} 完了</span>
            </div>
            {/* 進捗バー */}
            <div style={{ height:4, background:"#21262d", borderRadius:999, marginTop:SP.xs, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${completionPct}%`, background: completionPct===100 ? C.ok : C.accent, borderRadius:999, transition:"width .3s" }} />
            </div>
          </div>
          <div style={{ width:1, background:C.border }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:FS.meta, color:C.muted, fontWeight:700, letterSpacing:0.5 }}>急ぎ対応</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:SP.xs, marginTop:4 }}>
              <span style={{ fontSize:FS.score, fontWeight:800, color: undoneUrgent>0 ? C.danger : C.ok, lineHeight:1 }}>{undoneUrgent}</span>
              <span style={{ fontSize:FS.body, color:C.muted, fontWeight:700 }}>件</span>
            </div>
            <div style={{ fontSize:FS.meta, color:C.muted, marginTop:SP.xs }}>未完了 計 {undoneTotal} 件</div>
          </div>
        </div>

        {/* L2: 状況 — 現在のモードと判断材料 */}
        <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:`${SP.sm}px ${SP.md}px`, marginBottom:SP.sm }}>
          <div style={{ display:"flex", alignItems:"center", gap:SP.xs, marginBottom:SP.xs }}>
            <span style={{ fontSize:FS.micro, padding:"2px 8px", borderRadius:999, background: tripMode==="before" ? "#60a5fa22" : "#34d39922", color: tripMode==="before" ? C.accent : C.ok, fontWeight:700, letterSpacing:0.5 }}>
              {tripMode==="before" ? "🧳 旅行前" : "🛫 旅行中"}
            </span>
            <span style={{ fontSize:FS.meta, color:C.muted }}>あと {daysToGo} 日</span>
          </div>
          <div style={{ fontSize:FS.body, color:C.text, lineHeight:1.6 }}>
            {tripMode==="before"
              ? (undoneUrgent>0 ? `🔴 急ぎ ${undoneUrgent} 件 — 期限切れに注意` : "✅ 急ぎはなし。残りタスクを順次消化")
              : "⏱ 移動は予定時刻の 30 分前に開始が目安"}
          </div>
        </div>

        {/* L3: 対戦 — 次の予定（旅程上の "今日のカード"） */}
        {(() => {
          const day = DAYS[0];
          const next = day?.schedule?.[0];
          if (!day || !next) return null;
          return (
            <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${day.theme}55`, padding:`${SP.sm}px ${SP.md}px`, marginBottom:SP.sm }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:SP.xs }}>
                <span style={{ fontSize:FS.meta, color:C.muted, fontWeight:700, letterSpacing:0.5 }}>📅 次の予定</span>
                <span style={{ fontSize:FS.micro, padding:"2px 7px", borderRadius:4, background:`${day.theme}22`, color:day.theme, fontWeight:700 }}>{day.label}</span>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:SP.xs, marginBottom:4 }}>
                <span style={{ fontSize:FS.scoreSm, fontWeight:800, color:day.theme, lineHeight:1 }}>{next.time}</span>
                <span style={{ fontSize:FS.title, fontWeight:700, color:C.text }}>{next.icon} {next.title}</span>
              </div>
              <div style={{ fontSize:FS.meta, color:C.muted, lineHeight:1.6 }}>{next.note}</div>
            </div>
          );
        })()}

        {/* L4: 操作 — 要対応を集約、「判断」と「行動」を縦に分離。親指圏で完結 */}
        {urgentTodos.length > 0 && (
          <div style={{ background:"linear-gradient(180deg,#2a1414,#161b22)", borderRadius:12, border:`1px solid ${C.danger}55`, padding:`${SP.sm}px ${SP.md}px`, marginBottom:SP.sm }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:SP.sm }}>
              <span style={{ fontSize:FS.meta, color:C.danger, fontWeight:700, letterSpacing:0.5 }}>⚠️ 要対応</span>
              <span style={{ fontSize:FS.micro, padding:"2px 7px", borderRadius:999, background:`${C.danger}22`, color:C.danger, fontWeight:700 }}>{urgentTodos.length} 件</span>
            </div>
            {urgentTodos.slice(0,3).map((t, i) => (
              <div key={i} style={{ marginBottom: i<urgentTodos.slice(0,3).length-1 ? SP.xs : 0, padding:`${SP.xs}px ${SP.sm-2}px`, background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
                {/* 判断ゾーン（情報） */}
                <div style={{ fontSize:FS.body, color:C.text, fontWeight:700, lineHeight:1.5 }}>{t.text}</div>
                <div style={{ display:"flex", gap:6, marginTop:SP.xs-2, flexWrap:"wrap" }}>
                  <span style={{ fontSize:FS.micro, padding:"1px 6px", borderRadius:4, background:"#21262d", color:C.muted }}>{t.assignee}</span>
                  <span style={{ fontSize:FS.micro, padding:"1px 6px", borderRadius:4, background:"#60a5fa22", color:C.accent }}>期限 {t.due}</span>
                </div>
                {/* 行動ゾーン（タップ領域・親指圏） */}
                <div style={{ display:"flex", gap:SP.xs, marginTop:SP.xs }}>
                  {t.url && (
                    <a href={t.url} target="_blank" rel="noopener noreferrer" style={{
                      flex:1, textAlign:"center", padding:"10px 12px", borderRadius:8,
                      background:C.danger, color:"#fff", fontSize:FS.body, fontWeight:700,
                      textDecoration:"none", minHeight:44, display:"flex", alignItems:"center", justifyContent:"center",
                      WebkitTapHighlightColor:"transparent",
                    }}>今すぐ申請する →</a>
                  )}
                  <button
                    onClick={() => {
                      const idx = todos.findIndex(x => x.text === t.text);
                      const next = [...todos];
                      next[idx] = { ...next[idx], done: true };
                      setTodos(next);
                    }}
                    style={{
                      padding:"10px 14px", borderRadius:8,
                      background:"transparent", border:`1px solid ${C.borderHi}`, color:C.muted,
                      fontSize:FS.body, fontWeight:700, fontFamily:"inherit", cursor:"pointer", minHeight:44,
                      WebkitTapHighlightColor:"transparent",
                    }}
                  >完了</button>
                </div>
              </div>
            ))}
            {urgentTodos.length > 3 && (
              <button onClick={() => setTab("todo")} style={{
                width:"100%", marginTop:SP.xs, padding:"8px 0", borderRadius:8,
                background:"transparent", border:`1px dashed ${C.borderHi}`, color:C.muted,
                fontSize:FS.meta, fontWeight:700, fontFamily:"inherit", cursor:"pointer",
              }}>残り {urgentTodos.length - 3} 件を表示 →</button>
            )}
          </div>
        )}
      </>
    )}

    {/* ── 日程タブ：日別カード（3層階層 + 8/14/18 余白） ── */}
    {tab === "schedule" && (
      <div>
        <div style={{ fontSize:FS.meta, color:C.muted, fontWeight:700, letterSpacing:0.5, marginBottom:SP.xs, paddingLeft:2 }}>📅 日程一覧</div>
        {DAYS.map((day, dayIdx) => (
          <div key={day.id} style={{ marginBottom:SP.xs+2, borderRadius:12, overflow:"hidden", border:`1px solid ${day.theme}44` }}>
            <div onClick={() => setOpenDay(openDay===day.id ? null : day.id)}
              style={{ background:`${day.theme}18`, padding:`${SP.sm-2}px ${SP.md-2}px`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", WebkitTapHighlightColor:"transparent", minHeight:48 }}>
              <div style={{ display:"flex", alignItems:"center", gap:SP.sm-4, minWidth:0 }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{day.icon}</span>
                <div style={{ minWidth:0 }}>
                  {/* L1: 日付 / L2: タイトル / L3: 行程数 */}
                  <div style={{ fontWeight:800, color:day.theme, fontSize:FS.title, lineHeight:1.2 }}>{day.label}</div>
                  <div style={{ fontSize:FS.meta, color:C.text, marginTop:2, fontWeight:600 }}>{day.title}</div>
                  <div style={{ fontSize:FS.micro, color:C.muted, marginTop:2 }}>{day.schedule.length} 行程・Day {dayIdx+1}</div>
                </div>
              </div>
              <span style={{ color:day.theme, fontSize:FS.body, marginLeft:SP.xs, flexShrink:0 }}>{openDay===day.id ? "▲" : "▼"}</span>
            </div>
            {openDay===day.id && (
              <div style={{ background:C.bg, padding:`${SP.sm}px ${SP.md-2}px` }}>
                {day.schedule.map((s, i) => (
                  <div key={i} style={{ display:"flex", gap:SP.sm-4, marginBottom:i<day.schedule.length-1 ? SP.sm : 0, paddingBottom: i<day.schedule.length-1 ? SP.sm : 0, borderBottom: i<day.schedule.length-1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width:46, flexShrink:0, textAlign:"right" }}>
                      {/* L2: 時刻（見出し級） */}
                      <span style={{ fontSize:FS.body, color:day.theme, fontWeight:800, lineHeight:1.2 }}>{s.time}</span>
                    </div>
                    <div style={{ fontSize:18, flexShrink:0, lineHeight:1.2 }}>{s.icon}</div>
                    <div style={{ minWidth:0, flex:1 }}>
                      {/* L2: タイトル / L3: 補足 */}
                      <div style={{ fontSize:FS.body, fontWeight:700, color:C.text, lineHeight:1.4 }}>{s.title}</div>
                      <div style={{ fontSize:FS.meta, color:C.muted, marginTop:4, lineHeight:1.7, whiteSpace:"pre-line" }}>{s.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* ── 地図タブ ── */}
    {tab === "map" && (
      <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
        <MapView />
      </div>
    )}

    {/* ── ディズニータブ ── */}
    {tab === "disney" && (
      <div>
        {/* ヘッダー */}
        <div style={{ background:"linear-gradient(135deg,#1c1030,#0d1117)", borderRadius:10, padding:"10px 14px", marginBottom:12, border:"1px solid #c084fc44" }}>
          <div style={{ fontSize:12, color:"#c084fc", fontWeight:"bold" }}>🏰 Disney パーク ガイド</div>
          <div style={{ fontSize:11, color:"#8b949e", marginTop:3 }}>8/23 Disneyland Park｜8/24 California Adventure</div>
        </div>

        {/* サブタブ */}
        <div style={{ display:"flex", gap:6, marginBottom:14 }}>
          {[
            { id:"ll",    label:"⚡ ライトニングレーン" },
            { id:"shows", label:"🎭 ショー・パレード" },
          ].map(st => (
            <button key={st.id} onClick={() => setDisneySubTab(st.id)} style={{
              flex:1, padding:"8px 6px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:"bold",
              background: disneySubTab === st.id ? "#c084fc" : "#161b22",
              color:       disneySubTab === st.id ? "#0d1117"  : "#8b949e",
              outline:     disneySubTab === st.id ? "none"     : "1px solid #30363d",
              transition:"background 0.15s",
            }}>{st.label}</button>
          ))}
        </div>

        {/* ── サブタブ：ライトニングレーン ── */}
        {disneySubTab === "ll" && (
          <>
            {/* Lightning Lane説明バナー */}
            <div style={{ background:"#161b22", borderRadius:10, padding:"10px 14px", marginBottom:12, border:"1px solid #fbbf2444" }}>
              <div style={{ fontSize:12, fontWeight:"bold", color:"#fbbf24", marginBottom:6 }}>⚡ Lightning Lane の種類</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[
                  { label:"Single Pass", color:"#ef4444" },
                  { label:"Multi Pass ✅", color:"#34d399" },
                  { label:"対象外", color:"#475569" },
                ].map((b,i) => (
                  <div key={i} style={{ background:`${b.color}18`, border:`1px solid ${b.color}44`, borderRadius:6, padding:"4px 8px", fontSize:10, color:b.color, fontWeight:"bold" }}>{b.label}</div>
                ))}
              </div>
            </div>

            {[
              {
                park:"🏰 8/23 Disneyland Park", parkColor:"#f87171",
                note:"開園23:00まで。入園後すぐにLightning LaneをアプリでBookすること！",
                tip:"最初のLL予約は Indiana Jones Adventure か Space Mountain がおすすめ",
                attractions:[
                  { name:"Indiana Jones Adventure",          ll:"multi",  priority:"🔥 最優先", note:"序盤に予約。窓が早く埋まる",           rating:5 },
                  { name:"Space Mountain",                   ll:"multi",  priority:"🔥 最優先", note:"早めに予約。深夜が最高",               rating:5 },
                  { name:"Star Wars: Rise of the Resistance",ll:"single", priority:"⭐ 優先",   note:"Single Pass別途購入（$15〜35）",       rating:5 },
                  { name:"Pirates of the Caribbean",        ll:"none",   priority:"",          note:"待機列のみ。ディズニー伝統の名作",       rating:5 },
                  { name:"Haunted Mansion",                  ll:"multi",  priority:"△ 低優先",  note:"待機列が動くことが多い。雰囲気抜群",    rating:4 },
                  { name:"Tiana's Bayou Adventure",          ll:"multi",  priority:"⭐ 優先",   note:"新アトラクション。濡れるので注意",       rating:4 },
                  { name:"Matterhorn Bobsleds",              ll:"multi",  priority:"◎ 余裕あれば", note:"ディズニー最古のローラーコースター",  rating:4 },
                  { name:"Big Thunder Mountain Railroad",    ll:"multi",  priority:"◎ 余裕あれば", note:"ファミリー向け定番。スリルと楽しさのバランス◎", rating:4 },
                  { name:"Mickey & Minnie's Runaway Railway",ll:"multi",  priority:"◎ 余裕あれば", note:"トラックレス最新技術。映像と動きが連動", rating:4 },
                  { name:"Millennium Falcon: Smugglers Run", ll:"multi",  priority:"◎ 余裕あれば", note:"操縦体験型。SW好きなら必乗",           rating:4 },
                  { name:"Peter Pan's Flight",              ll:"none",   priority:"",          note:"待機列のみ。幻想的だが列が長い",         rating:4 },
                  { name:"Buzz Lightyear Astro Blasters",   ll:"multi",  priority:"△ 低優先",  note:"シューティング系。スコアを競えて楽しい", rating:3 },
                  { name:"Roger Rabbit's Car Toon Spin",    ll:"multi",  priority:"△ 低優先",  note:"",                                     rating:3 },
                  { name:"Star Tours",                      ll:"multi",  priority:"△ 低優先",  note:"SWファンにはおすすめ。毎回ルート変化",  rating:3 },
                  { name:"It's a Small World",              ll:"multi",  priority:"△ 低優先",  note:"ディズニー定番。ゆったり観光に",        rating:3 },
                  { name:"Finding Nemo Submarine Voyage",   ll:"none",   priority:"",          note:"待機列のみ。子供向け",                  rating:3 },
                  { name:"Autopia",                         ll:"multi",  priority:"△ 低優先",  note:"ミニカー体験。スリルはなし",            rating:2 },
                ],
              },
              {
                park:"🎢 8/24 California Adventure", parkColor:"#c084fc",
                note:"開園8:00（予定）。開園と同時入場が鉄則！Radiator Springs Racersを最優先で！",
                tip:"入園直後：Radiator Springs Racers の Single Pass を即購入→ WEB SLINGERS の Multi Pass を予約",
                attractions:[
                  { name:"Radiator Springs Racers",                  ll:"single", priority:"🔥 最優先", note:"Single Pass別途購入（$15〜35）。入園直後に即購入！", rating:5 },
                  { name:"Guardians of the Galaxy – Mission: BREAKOUT!", ll:"multi", priority:"🔥 最優先", note:"早めに予約。窓が埋まりやすい",              rating:5 },
                  { name:"Soarin' Around the World",                 ll:"multi",  priority:"◎ 余裕あれば", note:"映像・風・香りが融合した没入体験。絶景",   rating:5 },
                  { name:"WEB SLINGERS: A Spider-Man Adventure",     ll:"multi",  priority:"⭐ 優先",   note:"入園後すぐに予約。インタラクティブ体験◎",   rating:4 },
                  { name:"Toy Story Midway Mania!",                  ll:"multi",  priority:"⭐ 優先",   note:"午後に窓が遅くなりがち。スコア対決が白熱",  rating:4 },
                  { name:"Incredicoaster",                           ll:"multi",  priority:"◎ 余裕あれば", note:"夕暮れ時に乗ると最高。DCA唯一のコースター", rating:4 },
                  { name:"Grizzly River Run",                        ll:"multi",  priority:"◎ 余裕あれば", note:"濡れるので早めに乗る。夏は最高に気持ちいい", rating:3 },
                  { name:"Mater's Junkyard Jamboree",                ll:"none",   priority:"",          note:"待機列のみ。子供に大人気",                  rating:3 },
                  { name:"Goofy's Sky School",                       ll:"multi",  priority:"△ 低優先",  note:"コースター初心者・子供向け",                rating:3 },
                  { name:"The Little Mermaid – Ariel's Undersea Adventure", ll:"multi", priority:"△ 低優先", note:"ゆったり系。ファミリー向け",         rating:3 },
                  { name:"Monsters, Inc. Mike & Sulley to the Rescue!", ll:"multi", priority:"△ 低優先", note:"子供向けの優しいライド",                  rating:3 },
                  { name:"Luigi's Rollickin' Roadsters",             ll:"none",   priority:"",          note:"待機列のみ。キャラ好きなら",               rating:3 },
                ],
              }
            ].map((park, pi) => (
              <div key={pi} style={{ marginBottom:20 }}>
                <div style={{ background:`${park.parkColor}18`, border:`1px solid ${park.parkColor}44`, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
                  <div style={{ fontSize:13, fontWeight:"bold", color:park.parkColor, marginBottom:4 }}>{park.park}</div>
                  <div style={{ fontSize:11, color:"#8b949e", marginBottom:6, lineHeight:1.5 }}>{park.note}</div>
                  <div style={{ fontSize:11, color:"#fbbf24", background:"rgba(251,191,36,0.1)", borderRadius:6, padding:"5px 8px" }}>
                    💡 {park.tip}
                  </div>
                </div>
                {(() => {
                  const llMap = {
                    single: { label:"Single Pass", color:"#ef4444", bg:"rgba(239,68,68,0.12)" },
                    multi:  { label:"Multi Pass ✅", color:"#34d399", bg:"rgba(52,211,153,0.1)" },
                    none:   { label:"通常待機のみ", color:"#6b7280", bg:"rgba(107,114,128,0.1)" },
                  };
                  const renderStars = (rating) => {
                    if (!rating) return null;
                    return (
                      <span style={{ fontSize:11, letterSpacing:1 }}>
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{ color: i <= rating ? "#fbbf24" : "#374151" }}>★</span>
                        ))}
                      </span>
                    );
                  };
                  const renderAttraction = (a, key) => {
                    const llConfig = llMap[a.ll];
                    return (
                      <div key={key} style={{
                        background:"#161b22", borderRadius:8, padding:"9px 12px", marginBottom:6,
                        border:`1px solid ${a.ll==="single"?"#ef444433":a.ll==="multi"?"#34d39922":"#21262d"}`,
                        display:"flex", alignItems:"center", gap:10
                      }}>
                        <div style={{ background:llConfig.bg, border:`1px solid ${llConfig.color}44`, borderRadius:5, padding:"2px 7px", fontSize:10, color:llConfig.color, fontWeight:"bold", flexShrink:0, minWidth:86, textAlign:"center" }}>
                          {llConfig.label}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                            <span style={{ fontSize:12, fontWeight:"bold", color: a.ll==="none" ? "#8b949e" : "#e6edf3" }}>{a.name}</span>
                            {renderStars(a.rating)}
                          </div>
                          {(a.priority || a.note) && (
                            <div style={{ fontSize:10, color:"#8b949e", marginTop:2 }}>
                              {a.priority && <span style={{ color: a.priority.startsWith("🔥")?"#ef4444":a.priority.startsWith("⭐")?"#fbbf24":"#8b949e" }}>{a.priority}</span>}
                              {a.priority && a.note && " · "}
                              {a.note}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };
                  const llAttractions = park.attractions.filter(a => a.ll !== "none");
                  const noLLAttractions = park.attractions.filter(a => a.ll === "none");
                  return (
                    <>
                      <div style={{ fontSize:11, fontWeight:"bold", color:"#fbbf24", marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                        <span>⚡ Lightning Lane 対象</span>
                        <span style={{ background:"#fbbf2422", border:"1px solid #fbbf2444", borderRadius:10, padding:"1px 7px", fontSize:10, color:"#fbbf24" }}>{llAttractions.length}件</span>
                      </div>
                      {llAttractions.map((a, ai) => renderAttraction(a, `ll-${ai}`))}
                      {noLLAttractions.length > 0 && (
                        <>
                          <div style={{ fontSize:11, fontWeight:"bold", color:"#6b7280", marginTop:10, marginBottom:6, display:"flex", alignItems:"center", gap:6, paddingTop:10, borderTop:"1px dashed #21262d" }}>
                            <span>🚶 Lightning Lane 対象外</span>
                            <span style={{ background:"#6b728022", border:"1px solid #6b728044", borderRadius:10, padding:"1px 7px", fontSize:10, color:"#6b7280" }}>{noLLAttractions.length}件</span>
                          </div>
                          {noLLAttractions.map((a, ai) => renderAttraction(a, `none-${ai}`))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            ))}

            {/* 公式確認ボタン */}
            <div style={{ background:"#161b22", borderRadius:10, padding:"12px 14px", border:"1px solid #30363d", marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:"bold", color:"#8b949e", marginBottom:10 }}>🔗 公式サイトで最新情報を確認</div>
              {[
                { label:"⚡ Lightning Lane 公式ページ", url:"https://disneyland.disney.go.com/lightning-lane-passes/", color:"#fbbf24" },
                { label:"🏰 Disneyland Park アトラクション一覧", url:"https://disneyland.disney.go.com/destinations/disneyland/attractions/", color:"#f87171" },
                { label:"🎢 California Adventure アトラクション一覧", url:"https://disneyland.disney.go.com/destinations/disney-california-adventure/attractions/", color:"#c084fc" },
                { label:"📱 Disneylandアプリ（iOS）", url:"https://apps.apple.com/jp/app/disneyland/id1022164656", color:"#60a5fa" },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"9px 12px", marginBottom:6, borderRadius:8,
                  background:`${link.color}12`, border:`1px solid ${link.color}44`,
                  textDecoration:"none"
                }}>
                  <span style={{ fontSize:12, color:link.color, fontWeight:"bold" }}>{link.label}</span>
                  <span style={{ fontSize:12, color:link.color }}>→</span>
                </a>
              ))}
            </div>
          </>
        )}

        {/* ── サブタブ：ショー・パレード ── */}
        {disneySubTab === "shows" && (
          <>
            {/* 注意バナー */}
            <div style={{ background:"#161b22", borderRadius:10, padding:"10px 14px", marginBottom:12, border:"1px solid #60a5fa44" }}>
              <div style={{ fontSize:12, fontWeight:"bold", color:"#60a5fa", marginBottom:4 }}>🗓 開催時間は当日アプリで要確認</div>
              <div style={{ fontSize:10, color:"#8b949e", lineHeight:1.6 }}>
                公演時間・回数は季節・曜日によって変わります。Disneylandアプリの「Entertainment」から最新スケジュールを確認してください。
              </div>
            </div>

            {/* おすすめ度凡例 */}
            <div style={{ background:"#161b22", borderRadius:10, padding:"10px 14px", marginBottom:14, border:"1px solid #30363d", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:11, color:"#8b949e", flexShrink:0 }}>おすすめ度：</div>
              <div style={{ fontSize:13, letterSpacing:1 }}>
                {"★★★★★"}
                <span style={{ color:"#475569", marginLeft:4, fontSize:10 }}>= 絶対見て！</span>
              </div>
            </div>

            {[
              {
                park:"🏰 8/23 Disneyland Park", parkColor:"#f87171",
                shows:[
                  {
                    name:"Magic Happens Parade",
                    type:"parade",
                    recommend:5,
                    times:"11:00 / 15:00頃（2回）",
                    duration:"約25分",
                    location:"Main Street → Fantasyland",
                    note:"30分前から場所取り推奨。Castle手前のHubがベストポジション",
                    highlight:"🔥 絶対おすすめ",
                  },
                  {
                    name:"Fantasmic!",
                    type:"show",
                    recommend:5,
                    times:"21:00 / 22:30頃（2回）",
                    duration:"約25分",
                    location:"Rivers of America",
                    note:"Dining Package（$85〜）か早めの場所取りが必須。最前列は濡れる注意",
                    highlight:"🔥 絶対おすすめ",
                  },
                  {
                    name:"Wondrous Journeys（花火＆プロジェクション）",
                    type:"show",
                    recommend:5,
                    times:"21:30頃（天候次第・1回）",
                    duration:"約20分",
                    location:"Central Plaza（Sleeping Beauty Castle前）",
                    note:"Castle正面のHubが最高席。雨・強風でキャンセルあり。早めに場所確保を",
                    highlight:"🔥 絶対おすすめ",
                  },
                  {
                    name:"Mickey and the Magical Map",
                    type:"show",
                    recommend:3,
                    times:"複数回公演（アプリで確認）",
                    duration:"約22分",
                    location:"Fantasyland Theatre",
                    note:"座って観られるので歩き疲れた午後の休憩にぴったり",
                    highlight:"◎ 余裕あれば",
                  },
                ],
              },
              {
                park:"🎢 8/24 California Adventure", parkColor:"#c084fc",
                shows:[
                  {
                    name:"World of Color",
                    type:"show",
                    recommend:5,
                    times:"21:00 / 22:15頃（2回）",
                    duration:"約24分",
                    location:"Paradise Bay（Paradise Gardens Park）",
                    note:"Viewing Experience LL（$25〜）か無料エリアを2時間前から確保推奨。前方列は霧で濡れる",
                    highlight:"🔥 絶対おすすめ",
                  },
                  {
                    name:"Better Together: A Pixar Pals Celebration!",
                    type:"parade",
                    recommend:4,
                    times:"11:30 / 14:30頃（2回）",
                    duration:"約25分",
                    location:"Buena Vista Street → Hollywood Blvd",
                    note:"PixarキャラクターがフロートやダンスでBuena Vista Streetを盛り上げる",
                    highlight:"⭐ おすすめ",
                  },
                  {
                    name:"Avengers Campus スーパーヒーロー登場",
                    type:"show",
                    recommend:3,
                    times:"1日数回（アプリで確認）",
                    duration:"約10〜15分",
                    location:"Avengers Campus",
                    note:"Spider-Man・Iron Man・Captain Americaなどが登場。整理券不要で観やすい",
                    highlight:"◎ 余裕あれば",
                  },
                  {
                    name:"Disney Junior Dance Party!",
                    type:"show",
                    recommend:3,
                    times:"複数回公演（アプリで確認）",
                    duration:"約25分",
                    location:"Sunset Showcase Theater",
                    note:"子ども向けインタラクティブショー。大人も楽しめてエアコンで涼めるので暑い日の休憩に◎",
                    highlight:"◎ 余裕あれば",
                  },
                ],
              },
            ].map((park, pi) => (
              <div key={pi} style={{ marginBottom:20 }}>
                {/* パークヘッダー */}
                <div style={{ background:`${park.parkColor}18`, border:`1px solid ${park.parkColor}44`, borderRadius:10, padding:"10px 14px", marginBottom:10 }}>
                  <div style={{ fontSize:13, fontWeight:"bold", color:park.parkColor }}>{park.park}</div>
                </div>

                {park.shows.map((show, si) => {
                  const stars = show.recommend;
                  const starStr = "★".repeat(stars) + "☆".repeat(5 - stars);
                  const starColor = stars === 5 ? "#fbbf24" : stars === 4 ? "#f97316" : "#6b7280";
                  const typeBadge = show.type === "parade"
                    ? { label:"パレード", color:"#60a5fa" }
                    : { label:"ショー",   color:"#a78bfa" };
                  const hlColor = show.highlight.startsWith("🔥") ? "#ef4444"
                                : show.highlight.startsWith("⭐") ? "#fbbf24"
                                : "#6b7280";
                  return (
                    <div key={si} style={{
                      background:"#161b22", borderRadius:10, padding:"12px 14px", marginBottom:8,
                      border:`1px solid ${stars===5?"#fbbf2433":stars===4?"#f9731633":"#21262d"}`,
                    }}>
                      {/* 上段：バッジ＋おすすめ度 */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <span style={{ background:`${typeBadge.color}22`, border:`1px solid ${typeBadge.color}55`, borderRadius:5, padding:"2px 7px", fontSize:10, color:typeBadge.color, fontWeight:"bold" }}>
                            {typeBadge.label}
                          </span>
                          <span style={{ background:`${hlColor}18`, border:`1px solid ${hlColor}44`, borderRadius:5, padding:"2px 7px", fontSize:10, color:hlColor, fontWeight:"bold" }}>
                            {show.highlight}
                          </span>
                        </div>
                        <div style={{ fontSize:14, color:starColor, letterSpacing:1 }}>{starStr}</div>
                      </div>

                      {/* タイトル */}
                      <div style={{ fontSize:13, fontWeight:"bold", color:"#e6edf3", marginBottom:6 }}>{show.name}</div>

                      {/* 時間・場所 */}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 12px", marginBottom:6 }}>
                        <div style={{ fontSize:10, color:"#8b949e" }}>🕐 {show.times}</div>
                        <div style={{ fontSize:10, color:"#8b949e" }}>⏱ {show.duration}</div>
                        <div style={{ fontSize:10, color:"#8b949e" }}>📍 {show.location}</div>
                      </div>

                      {/* メモ */}
                      <div style={{ fontSize:11, color:"#60a5fa", background:"rgba(96,165,250,0.08)", borderRadius:6, padding:"5px 8px", lineHeight:1.6 }}>
                        💡 {show.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 公式リンク */}
            <div style={{ background:"#161b22", borderRadius:10, padding:"12px 14px", border:"1px solid #30363d", marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:"bold", color:"#8b949e", marginBottom:10 }}>🔗 公式サイトで最新情報を確認</div>
              {[
                { label:"🏰 Disneyland Park エンタメ一覧", url:"https://disneyland.disney.go.com/destinations/disneyland/entertainment/", color:"#f87171" },
                { label:"🎢 California Adventure エンタメ一覧", url:"https://disneyland.disney.go.com/destinations/disney-california-adventure/entertainment/", color:"#c084fc" },
                { label:"📱 Disneylandアプリ（iOS）", url:"https://apps.apple.com/jp/app/disneyland/id1022164656", color:"#60a5fa" },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"9px 12px", marginBottom:6, borderRadius:8,
                  background:`${link.color}12`, border:`1px solid ${link.color}44`,
                  textDecoration:"none"
                }}>
                  <span style={{ fontSize:12, color:link.color, fontWeight:"bold" }}>{link.label}</span>
                  <span style={{ fontSize:12, color:link.color }}>→</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    )}

    {/* ── グルメタブ ── */}
    {tab === "gourmet" && (
      <div>
        <div style={{ background:"linear-gradient(135deg,#1c2e1c,#0d1117)", borderRadius:10, padding:"10px 14px", marginBottom:12, border:"1px solid #34d39944" }}>
          <div style={{ fontSize:12, color:"#34d399", fontWeight:"bold" }}>🍴 LAグルメ ガイド</div>
          <div style={{ fontSize:11, color:"#8b949e", marginTop:3 }}>旅程に合わせたおすすめ飲食店。🔥マークは特に食べてほしい一品！</div>
        </div>
        {GOURMET.map((cat, ci) => (
          <div key={ci} style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:"bold", color:"#8b949e", marginBottom:8, paddingLeft:4, borderLeft:"3px solid #34d399" }}>
              {cat.category}
            </div>
            {cat.items.map((item, ii) => (
              <div key={ii} style={{ background:"#161b22", borderRadius:10, marginBottom:8, border:`1px solid ${item.must ? "#34d39944" : "#21262d"}`, overflow:"hidden" }}>
                <SmartImage imageUrl={item.img} altText={item.name} onZoom={() => setSelectedImage({ url:sanitizeImageUrl(item.img), alt:item.name })} />
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13, fontWeight:"bold", color:"#e6edf3" }}>
                        {item.must && "🔥 "}{item.name}
                      </span>
                    </div>
                    <span style={{ fontSize:11, fontWeight:"bold", color:"#34d399", marginLeft:8, flexShrink:0 }}>{item.price}</span>
                  </div>
                  <div style={{ display:"flex", gap:5, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4, background:`${item.tagColor}22`, color:item.tagColor, fontWeight:"bold" }}>{item.tag}</span>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4, background:"#21262d", color:"#8b949e" }}>📍 {item.location}</span>
                  </div>
                  <div style={{ display:"flex", gap:4, marginBottom:6, flexWrap:"wrap" }}>
                    {item.days.map((d,di) => (
                      <span key={di} style={{ fontSize:10, padding:"1px 6px", borderRadius:3, background:"#21262d", color:"#8b949e" }}>{d}</span>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:"#8b949e", lineHeight:1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )}

    {/* ── グッズタブ ── */}
    {tab === "goods" && (
      <div>
        <div style={{ background:"linear-gradient(135deg,#1c1c2e,#0d1117)", borderRadius:10, padding:"10px 14px", marginBottom:12, border:"1px solid #c084fc44" }}>
          <div style={{ fontSize:12, color:"#c084fc", fontWeight:"bold" }}>🛍 買うべきグッズ・お土産</div>
          <div style={{ fontSize:11, color:"#8b949e", marginTop:3 }}>スーツケースの重量（23kg上限）に注意！帰りは余裕を持って。</div>
        </div>
        {GOODS.map((cat, ci) => (
          <div key={ci} style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:"bold", color:"#8b949e", paddingLeft:4, borderLeft:"3px solid #c084fc" }}>
                {cat.category}
              </div>
              {cat.must && <span style={{ fontSize:10, padding:"1px 7px", background:"#ef444422", color:"#ef4444", borderRadius:4, fontWeight:"bold" }}>必買</span>}
            </div>
            {cat.items.map((item, ii) => (
              <div key={ii} style={{ background:"#161b22", borderRadius:10, marginBottom:8, border:`1px solid ${cat.must ? "#c084fc33" : "#21262d"}`, overflow:"hidden" }}>
                <SmartImage imageUrl={item.img} altText={item.name} onZoom={() => setSelectedImage({ url:sanitizeImageUrl(item.img), alt:item.name })} />
                <div style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:"bold", color:"#e6edf3", flex:1 }}>{item.name}</span>
                  <span style={{ fontSize:12, fontWeight:"bold", color:"#c084fc", marginLeft:8, flexShrink:0 }}>{item.price}</span>
                </div>
                <div style={{ fontSize:10, color:"#60a5fa", marginBottom:5 }}>🏪 {item.where}</div>
                <div style={{ fontSize:11, color:"#8b949e", lineHeight:1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ background:"#161b22", borderRadius:10, padding:"12px 14px", border:"1px solid #fbbf2444", marginTop:4 }}>
          <div style={{ fontSize:12, fontWeight:"bold", color:"#fbbf24", marginBottom:6 }}>⚖️ 荷物重量チェックリスト</div>
          {[
            "SQプレエコ: 預け入れ23kg × 2個（1人あたり）",
            "帰りは+5kg程度を想定して余裕を持って",
            "液体類（ホットソース等）は預け入れ荷物に",
            "ディズニー土産はDowntown Disneyで最後にまとめ買い",
          ].map((tip,i) => (
            <div key={i} style={{ fontSize:11, color:"#8b949e", marginBottom:4, paddingLeft:10, borderLeft:"2px solid #fbbf2466", lineHeight:1.6 }}>{tip}</div>
          ))}
        </div>
      </div>
    )}
    {/* ── 費用タブ ── */}
    {tab === "cost" && (() => {
      const rate = usdJpy || 155;
      const fmt = n => Math.round(n).toLocaleString('ja-JP');
      const totalJpy = COSTS.reduce((s, c) => s + (c.jpy || 0) + (c.usd ? c.usd * rate : 0), 0);
      const totalNoFlight = totalJpy - 480280;
      return (
        <div>
          {/* ヘッダー＋レートバッジ */}
          <div style={{ background:"linear-gradient(135deg,#1c2e4a,#0d1117)", borderRadius:10, padding:"10px 14px", marginBottom:8, border:"1px solid #60a5fa44" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:12, color:"#60a5fa", fontWeight:"bold" }}>💴 旅行費用まとめ（2名）</div>
                <div style={{ fontSize:11, color:"#8b949e", marginTop:3 }}>確定済み費用と目安費用を一覧化</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0, marginLeft:10 }}>
                <div style={{ fontSize:9, color:"#8b949e", letterSpacing:0.5 }}>USD / JPY</div>
                <div style={{ fontSize:16, fontWeight:800, color: usdJpy ? "#34d399" : "#8b949e", lineHeight:1.2 }}>
                  ¥{rate}
                </div>
                <div style={{ fontSize:9, color: usdJpy ? "#34d399" : "#fbbf24", fontWeight:700 }}>
                  {usdJpy ? "● ライブ" : "○ 参考値"}
                </div>
              </div>
            </div>
          </div>

          {/* 確定費用リスト */}
          {COSTS.map((c, i) => {
            const isPaid = c.cat.includes("支払済");
            const jpyAmt = c.jpy ?? Math.round(c.usd * rate);
            return (
              <div key={i} style={{
                background:"#161b22", borderRadius:10, padding:"11px 14px", marginBottom:8,
                border:`1px solid ${isPaid ? "#30363d" : "#21262d"}`,
                opacity: isPaid ? 0.55 : 1,
              }}>
                <div style={{ fontSize:10, color:"#8b949e", marginBottom:2 }}>{c.cat}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontSize:13, color:"#e6edf3", flex:1 }}>{c.item}</span>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                    {c.usd && <div style={{ fontSize:10, color:"#8b949e" }}>${c.usd.toFixed(2)}</div>}
                    <div style={{ fontSize:14, fontWeight:"bold", color:"#34d399" }}>¥{fmt(jpyAmt)}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 動的合計 */}
          {[
            { label:"フライト込み総額",             amount: totalJpy,      color:"#60a5fa" },
            { label:"フライト除く（これから払う分）", amount: totalNoFlight, color:"#34d399" },
          ].map((t, i) => (
            <div key={i} style={{ background:"#1c2e4a", borderRadius:10, padding:"11px 14px", marginBottom:8, border:"1px solid #60a5fa66" }}>
              <div style={{ fontSize:10, color:"#8b949e", marginBottom:2 }}>🗺 確定合計</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#e6edf3" }}>{t.label}</span>
                <span style={{ fontSize:14, fontWeight:"bold", color:t.color }}>¥{fmt(t.amount)}</span>
              </div>
            </div>
          ))}

          {/* 未確定費用 */}
          <div style={{ background:"#161b22", borderRadius:10, padding:"12px 14px", marginTop:4, border:"1px solid #21262d" }}>
            <div style={{ fontSize:12, fontWeight:"bold", color:"#8b949e", marginBottom:8 }}>📊 未確定費用（目安）</div>
            {[
              { item:"Uber合計（全日程）",  lo:150, hi:200 },
              { item:"食費（6日間・2名）",  lo:300, hi:400 },
              { item:"お土産・ショッピング", lo:null, hi:null },
            ].map((r, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #21262d", fontSize:12 }}>
                <span style={{ color:"#8b949e" }}>{r.item}</span>
                <span style={{ color:"#fbbf24" }}>
                  {r.lo ? `$${r.lo}〜${r.hi} ≒¥${fmt(r.lo*rate)}〜¥${fmt(r.hi*rate)}` : "お好みで"}
                </span>
              </div>
            ))}
            <div style={{ marginTop:10, paddingTop:8, borderTop:"1px solid #30363d", display:"flex", justifyContent:"space-between", fontSize:13 }}>
              <span style={{ color:"#e6edf3", fontWeight:"bold" }}>🧮 総計目安（2名）</span>
              <span style={{ color:"#60a5fa", fontWeight:"bold" }}>
                ≒ ¥{fmt(totalJpy + 450*rate)}〜¥{fmt(totalJpy + 700*rate)}
              </span>
            </div>
          </div>
        </div>
      );
    })()}
    {tab === "safety" && (
      <div>
        <div style={{ background:"#161b22", borderRadius:10, padding:"12px 14px", marginBottom:10, border:"1px solid #ef444444" }}>
          <div style={{ fontSize:13, fontWeight:"bold", color:"#ef4444", marginBottom:8 }}>🚨 まず知っておくこと</div>
          {["観光客のリスクはほぼスリ・置き引き。貴重品は前ポケットへ",
            "夜21時以降のDTLA・Hollywoodは2人以上で行動",
            "Skid Rowはホテルから徒歩圏内だが絶対に近づかない",
            "Uberは正規アプリのみ。白タクは乗らない",
            "現金は最小限。カードメイン運用推奨"
          ].map((tip, i) => (
            <div key={i} style={{ fontSize:12, color:"#8b949e", marginBottom:5, paddingLeft:10, borderLeft:"2px solid #ef444466", lineHeight:1.6 }}>{tip}</div>
          ))}
        </div>
        <div style={{ background:"#161b22", borderRadius:10, padding:"12px 14px", border:"1px solid #21262d" }}>
          <div style={{ fontSize:13, fontWeight:"bold", color:"#60a5fa", marginBottom:10 }}>📍 旅程スポット別 治安評価</div>
          {SAFETY_SPOTS.map((r, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom: i<SAFETY_SPOTS.length-1 ? "1px solid #21262d" : "none", fontSize:12 }}>
              <span style={{ color:"#e6edf3" }}>{r.spot}</span>
              <span style={{ color:r.color, fontWeight:"bold" }}>{r.mark}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, background:"#161b22", borderRadius:10, padding:"12px 14px", border:"1px solid #21262d", fontSize:11, color:"#8b949e", lineHeight:1.8 }}>
          💡 治安エリアの詳細は<span style={{ color:"#60a5fa" }}>🗺 地図タブ</span>で確認できます（赤エリアが立入禁止）
        </div>
      </div>
    )}


    {/* ── ToDo タブ：完了率をスコア化、判断と行動を縦に分離 ── */}
    {tab === "todo" && (
      <div>
        {/* L1: スコア — 完了率 */}
        <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:`${SP.sm}px ${SP.md}px`, marginBottom:SP.sm }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:SP.sm }}>
            <div>
              <div style={{ fontSize:FS.meta, color:C.muted, fontWeight:700, letterSpacing:0.5 }}>ToDo 完了率</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:SP.xs, marginTop:4 }}>
                <span style={{ fontSize:FS.score, fontWeight:800, color: completionPct===100 ? C.ok : C.accent, lineHeight:1 }}>{completionPct}</span>
                <span style={{ fontSize:FS.body, color:C.muted, fontWeight:700 }}>%</span>
                <span style={{ fontSize:FS.meta, color:C.muted, marginLeft:SP.xs }}>{doneCount}/{todos.length}</span>
              </div>
            </div>
            {undoneUrgent > 0 && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:FS.meta, color:C.danger, fontWeight:700 }}>急ぎ</div>
                <div style={{ fontSize:FS.scoreSm, color:C.danger, fontWeight:800, lineHeight:1 }}>{undoneUrgent}<span style={{ fontSize:FS.body, marginLeft:2 }}>件</span></div>
              </div>
            )}
          </div>
          <div style={{ height:4, background:"#21262d", borderRadius:999, marginTop:SP.xs, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${completionPct}%`, background: completionPct===100 ? C.ok : C.accent, borderRadius:999, transition:"width .3s" }} />
          </div>
        </div>

        {/* 予約・証跡 */}
        <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:`${SP.sm}px ${SP.sm-2}px`, marginBottom:SP.sm }}>
          <div style={{ fontSize:FS.meta, color:C.muted, fontWeight:700, letterSpacing:0.5, marginBottom:SP.xs }}>🎫 予約・証跡（タップでコピー）</div>
          {RESERVATIONS.map((r, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard?.writeText(r.value)}
              style={{
                width:"100%", textAlign:"left", marginBottom: i<RESERVATIONS.length-1 ? 6 : 0,
                background:C.bg, color:C.text,
                border:`1px solid ${C.borderHi}`, borderRadius:8, padding:`${SP.xs}px ${SP.sm-4}px`,
                cursor:"pointer", fontFamily:"inherit", minHeight:44,
              }}
            >
              <div style={{ fontSize:FS.micro, color:C.muted }}>{r.label}</div>
              <div style={{ fontSize:FS.body }}>{r.value}</div>
            </button>
          ))}
        </div>

        {/* フィルタ */}
        <div style={{ display:"flex", gap:SP.xs, marginBottom:SP.xs, flexWrap:"wrap" }}>
          <button onClick={() => setShowIncompleteOnly(v => !v)} style={{
            border:`1px solid ${C.borderHi}`, borderRadius:999, padding:"6px 12px", fontSize:FS.meta,
            background:showIncompleteOnly ? "#34d39922" : C.surface, color:showIncompleteOnly ? C.ok : C.muted,
            fontFamily:"inherit", cursor:"pointer", fontWeight:700,
          }}>
            未完了のみ {showIncompleteOnly ? "ON" : "OFF"}
          </button>
          {assignees.map(a => (
            <button key={a} onClick={() => setAssigneeFilter(a)} style={{
              border:`1px solid ${C.borderHi}`, borderRadius:999, padding:"6px 12px", fontSize:FS.meta,
              background:assigneeFilter===a ? "#60a5fa22" : C.surface, color:assigneeFilter===a ? C.accent : C.muted,
              fontFamily:"inherit", cursor:"pointer", fontWeight:700,
            }}>
              {a==="all" ? "全員" : a}
            </button>
          ))}
        </div>

        {undoneUrgent > 0 && (
          <div style={{ background:"#1c1010", borderRadius:12, padding:`${SP.sm-2}px ${SP.md-2}px`, marginBottom:SP.sm, border:`1px solid ${C.danger}66` }}>
            <div style={{ fontSize:FS.body, color:C.danger, fontWeight:800 }}>🔴 急ぎのToDo が {undoneUrgent} 件残っています</div>
            <div style={{ fontSize:FS.meta, color:C.muted, marginTop:4, lineHeight:1.6 }}>The Broad・ディズニーは8月ピーク前に早急に予約を</div>
          </div>
        )}

        {visibleTodos.map((t, i) => (
          <div key={i} style={{
            background:C.surface, borderRadius:12, padding:`${SP.sm-2}px ${SP.md-2}px`, marginBottom:SP.xs,
            border:`1px solid ${t.done ? C.border : t.urgent ? C.danger+"55" : C.border}`,
            opacity: t.done ? 0.45 : 1, transition:"opacity 0.2s",
          }}>
            {/* 判断ゾーン：状態ピル + 本文 + メタ */}
            <div style={{ display:"flex", gap:SP.xs, alignItems:"flex-start" }}>
              <div style={{ fontSize:18, lineHeight:1.2, flexShrink:0 }}>{t.done ? "✅" : t.urgent ? "🔴" : "⬜"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:FS.body, color: t.done ? C.muted : C.text, textDecoration: t.done ? "line-through" : "none", lineHeight:1.5, fontWeight:600 }}>
                  {t.text}
                </div>
                <div style={{ display:"flex", gap:6, marginTop:SP.xs-2, flexWrap:"wrap" }}>
                  <span style={{ fontSize:FS.micro, padding:"2px 7px", borderRadius:4, background:"#21262d", color:C.muted }}>{t.assignee}</span>
                  <span style={{ fontSize:FS.micro, padding:"2px 7px", borderRadius:4, background:"#60a5fa22", color:C.accent }}>期限 {t.due}</span>
                  <span style={{ fontSize:FS.micro, padding:"2px 7px", borderRadius:4, background:"#fbbf2422", color:C.warn }}>通知 {t.notify}</span>
                </div>
              </div>
            </div>
            {/* 行動ゾーン（親指圏） */}
            {!t.done && (
              <div style={{ display:"flex", gap:SP.xs, marginTop:SP.sm-2 }}>
                {t.url && (
                  <a href={t.url} target="_blank" rel="noopener noreferrer" style={{
                    flex:1, textAlign:"center", padding:"10px 12px", borderRadius:8,
                    background: t.urgent ? C.danger : "#1c2e4a",
                    color:"#fff", fontSize:FS.body, fontWeight:700, textDecoration:"none",
                    minHeight:44, display:"flex", alignItems:"center", justifyContent:"center",
                    WebkitTapHighlightColor:"transparent",
                  }}>開く →</a>
                )}
                <button
                  onClick={() => {
                    const idx = todos.findIndex(x => x.text === t.text);
                    const next = [...todos];
                    next[idx] = { ...next[idx], done: !next[idx].done };
                    setTodos(next);
                  }}
                  style={{
                    flex: t.url ? "0 0 auto" : 1, padding:"10px 16px", borderRadius:8,
                    background:"transparent", border:`1px solid ${C.borderHi}`, color:C.muted,
                    fontSize:FS.body, fontWeight:700, fontFamily:"inherit", cursor:"pointer", minHeight:44,
                    WebkitTapHighlightColor:"transparent",
                  }}
                >完了にする</button>
              </div>
            )}
            {t.done && (
              <button
                onClick={() => {
                  const idx = todos.findIndex(x => x.text === t.text);
                  const next = [...todos];
                  next[idx] = { ...next[idx], done: false };
                  setTodos(next);
                }}
                style={{
                  width:"100%", marginTop:SP.xs, padding:"8px 12px", borderRadius:8,
                  background:"transparent", border:`1px dashed ${C.borderHi}`, color:C.muted,
                  fontSize:FS.meta, fontFamily:"inherit", cursor:"pointer",
                }}
              >未完了に戻す</button>
            )}
          </div>
        ))}
      </div>
    )}

  </div>

  {selectedImage.url && (
    <div
      onClick={() => setSelectedImage({ url:"", alt:"" })}
      style={{
        position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.82)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:16,
      }}
      role="button"
      aria-label="画像プレビューを閉じる"
    >
      <div
        style={{ maxWidth:540, width:"100%", background:"#0d1117", border:"1px solid #30363d", borderRadius:12, overflow:"hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderBottom:"1px solid #21262d" }}>
          <div style={{ fontSize:12, color:"#e6edf3", fontWeight:"bold" }}>{selectedImage.alt || "画像プレビュー"}</div>
          <button
            type="button"
            onClick={() => setSelectedImage({ url:"", alt:"" })}
            style={{ background:"transparent", border:"1px solid #30363d", color:"#8b949e", borderRadius:6, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit" }}
          >
            閉じる
          </button>
        </div>
        <img src={selectedImage.url} alt={selectedImage.alt || "プレビュー画像"} style={{ width:"100%", maxHeight:"75vh", objectFit:"contain", background:"#111827" }} />
      </div>
    </div>
  )}
</div>

);
}
