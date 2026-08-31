/**
 * Curated, tier-organized real-estate photo pools for seed scripts.
 *
 * Rebuilt 2026-08-27 to replace an earlier pool that mixed in clearly
 * unrelated results (a distorted low-angle office-building shot, a
 * construction worker mid-task) from broad, generic search terms. Every URL
 * here came from a precise Unsplash search ("modern house exterior",
 * "luxury mansion exterior", "cozy cottage exterior", etc.), with each
 * result checked against a live DOM query that flags Unsplash+ (paid/
 * licensed) results so none of those are included, and a sample from every
 * batch spot-checked visually before being kept.
 *
 * Grouped into three tiers so seed scripts can match a property's price
 * bracket to how upscale the photo actually looks — "grade the price
 * according to how they look" — instead of assigning photos sequentially
 * with no regard for whether the picture matches the number.
 *
 *   LUXURY      — modern architectural homes, mansions. Pair with ultra/high tier.
 *   MID         — suburban family homes, brick townhouses, ranch houses. Pair with mid tier.
 *   AFFORDABLE  — cozy cottages, apartment buildings. Pair with affordable tier.
 *
 * Each tier's EXTERIOR/INTERIOR arrays are indexed independently — pick by
 * index modulo the array's own length so callers never need to know exact
 * counts, and a photo may legitimately repeat across multiple listings
 * (ordinary for stock photography backing demo/seed data).
 */

export const EXTERIOR_LUXURY: string[] = [
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1627141234469-24711efb373c?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1706808849777-96e0d7be3bb7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1722421492323-eaf9c401befe?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1691425700585-c108acad6467?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1635006459494-c9b9665a666e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1698994705178-d244d73ea573?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1566908829550-e6551b00979b?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1583765748076-cac46b8c98c1?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1635111057505-3b7dcc2b72fb?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1756064173162-326c8e85215d?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1702441831852-669adb6e762f?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1674758979141-4e3521ba7321?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1527665830090-864a163d49ab?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1783125127199-860da9744dcc?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1783125127243-49158bb610a5?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1778910554261-837b19e25c26?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1719294008010-44116946e5b5?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1770622006495-86de934162b5?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1763600256998-6286a19e1dbb?auto=format&fit=crop&q=80&w=2070",
];

export const INTERIOR_LUXURY: string[] = [
  "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1613545325268-9265e1609167?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1613082294483-fec382d8367e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1638885930125-85350348d266?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1737898378296-94dc316cd443?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1758448511320-05d7d28f4298?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1638972691611-69633a3d3127?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1666969442529-caa46ad29336?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1592506119503-c0b18879bd5a?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1610177534644-34d881503b83?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1639751787355-bbc3ed1fd639?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1588796460718-f457ad1e1a1f?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1522790979484-0ca297a0b0f6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1638886043487-72d203fa66b6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1563493461953-aeee5e293b66?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1774716925718-82ea2f2eb01b?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1638541363822-6f4c189b5cf7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1589530006797-d67347f18caa?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1680210849773-f97a41c6b7ed?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1556595101-15dc5f6431e3?auto=format&fit=crop&q=80&w=2070",
];

export const EXTERIOR_MID: string[] = [
  "https://images.unsplash.com/photo-1565829262357-bf9669de2295?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773427657182-4776c4f5b363?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1784471691271-90285594dfc8?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1768768736208-b8f0e498e174?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1765765234094-bc009a3bba62?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1786964597843-835d9086607e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1771273142770-9af224cf2050?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773427621086-1f8511c78e39?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773409986023-2af6c4d39a75?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1784847332730-103be959c597?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1762374974129-f9266d9c4efc?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1764339838883-4728d4bcfe49?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1780965149537-9ff475543fa6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1767310692114-6bbff14308d5?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1769494244517-7aabbef35b28?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1777463627000-c2b9bf11f8ec?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1779372372057-e5b58c5d3f81?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1787069504899-bb867b2e0355?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1780061993243-88e4f3c06e75?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1770118469169-1c8560d45c36?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1782061817947-f1bf3c0a7e0e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1783444917333-dc2db9a7ae5e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1779898614792-dd858c58395a?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1745808930196-e03bf5fe6c02?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1784232815707-258639d45c0c?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1775226146712-3cf6eeef0aed?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1770625296834-5593038b0fd2?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1693837851506-93d3d01d4f44?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1686739645692-b5f8db241885?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1664425989440-91c9eb455a70?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1787094535228-b4861050479a?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773427626010-720ec1fab17a?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773427617774-d9ce7493b3d8?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1774655762504-5f3a07999cd7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1786550860403-4a58f184643e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1783114481815-f3b64b1aa2c0?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1706800061683-41e0313b67df?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1614297079063-cf2dc43dcf54?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773427614314-6bd0b6115a40?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1675275724396-f16c10fced75?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1675275698293-09d50d7f224d?auto=format&fit=crop&q=80&w=2070",
];

export const INTERIOR_MID: string[] = [
  "https://images.unsplash.com/photo-1724582586529-62622e50c0b3?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1724582586458-a51791349977?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1646987916641-1f3c8992daa2?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1705326701287-346fc37a2c86?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1724582586495-d050726cf354?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1720247520862-7e4b14176fa8?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1616137148650-4aa14651e02b?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1704040686510-b747ff423ebb?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1720247520881-672bc136da8a?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1672860044506-e3ec09653e82?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1680007889201-114ac772447d?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1649083048269-8bfb755e7b87?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1593136596203-7212b076f4d2?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1600488999806-8efb986d87b1?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1684928365214-5392bfb8a57e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1613545325268-314979eeef03?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1752004028694-72610be3604e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1701789575035-e55a9ef971c6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1628745423029-59d3491c0b44?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1635108197695-05184e426907?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1635108197332-54105c0ec888?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1684928365257-13121f2742ef?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1600489000300-e590b381ce48?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1564586880927-99376cbf0f4f?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1531410691118-74e9fbc0f57f?auto=format&fit=crop&q=80&w=2070",
];

export const EXTERIOR_AFFORDABLE: string[] = [
  "https://images.unsplash.com/photo-1772465971062-032970cf7a50?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1766777323830-6ed16e01fecf?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1783002933053-d169d7d23243?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1613310271953-b18bf33195fd?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1699209148943-acacf2821f33?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1771526163842-c82e771ec0e7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1773606381942-2be573da521d?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1777863073599-b83bacea860e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1699209148987-99772195bf9c?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1776219243449-a71b7f5c1332?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1786175652678-6cf212c043d8?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1690796033775-c924f7dfe5d1?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1767710924293-29fba5e3854b?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1777962822462-ec69821a2e59?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1624204386084-dd8c05e32226?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1516501312919-d0cb0b7b60b8?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1638973140785-3b918e290682?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1432297984334-707d34c4163a?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1592276040264-e10344a6a10e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1643906652169-a750f3f70848?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1610286986642-057ece0c3656?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1542309175-9b88d743f89f?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1605267143746-999bf61d0d08?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1626273947634-823f04de159e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1681039580747-569f9cd54858?auto=format&fit=crop&q=80&w=2070",
];

export const INTERIOR_AFFORDABLE: string[] = [
  "https://images.unsplash.com/photo-1696762932825-2737db830bbe?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1703783010857-9bd7a7b97c50?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1600494448655-ae58f58bb945?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1699869653495-fe26f4c70b3e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1663811397207-418a92396ad5?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1657040899594-34f4b6739988?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1644057501622-dfa7dd26dbfb?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1720430498633-a8908d8706d1?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1663811397007-010e535ffcd7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1606796913825-2b02883605e9?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1657040899601-fbcc8f6486f6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1699942681763-d1da9f692489?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1692455067486-d4637182a61c?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1604580040660-f0a7f9abaea6?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1642755622932-d1e0cb783dc5?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1643949700215-e61cdca053f7?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1644421439741-712c7fde7e95?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1742134131017-44d377a611b1?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1691036365036-71da57ac5919?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1754574741164-a41418029cfb?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1643949700830-2420cd030678?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1641870538280-1dd6690d419b?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1733425844220-feab971190ff?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1756079664354-34944e001f6d?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1744025098626-66c0b9cb1ba8?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1737233536991-8ee3f92b7781?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1667550177753-52b318cd4d40?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1641870538417-c83e621d1425?auto=format&fit=crop&q=80&w=2070",
];

/** Picks a (exterior, interior) pair from the tier matching a listing's price bracket. */
export type PhotoTier = 'luxury' | 'mid' | 'affordable';

const TIER_POOLS: Record<PhotoTier, { exterior: string[]; interior: string[] }> = {
  luxury: { exterior: EXTERIOR_LUXURY, interior: INTERIOR_LUXURY },
  mid: { exterior: EXTERIOR_MID, interior: INTERIOR_MID },
  affordable: { exterior: EXTERIOR_AFFORDABLE, interior: INTERIOR_AFFORDABLE },
};

/**
 * Deterministic pick within a tier — `index` can run past the pool's length;
 * it wraps (modulo), so a photo may repeat across listings once a tier's
 * pool is exhausted rather than throwing or falling back to the wrong tier.
 */
export function pickTierPhotos(tier: PhotoTier, index: number): { exterior: string; interior: string } {
  const pool = TIER_POOLS[tier];
  return {
    exterior: pool.exterior[index % pool.exterior.length],
    interior: pool.interior[index % pool.interior.length],
  };
}
