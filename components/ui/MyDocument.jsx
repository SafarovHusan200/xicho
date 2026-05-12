import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';

const colors = {
  navy: '#0D1B2A',
  orange: '#F4821F',
  lightOrange: '#FFF4E6',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  white: '#FFFFFF',
  green: '#16A34A',
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    fontSize: 9,
  },

  // ── HEADER ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {},
  mainTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 7.5,
    color: colors.gray,
    letterSpacing: 1.5,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  permitBadge: {
    backgroundColor: colors.navy,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  qrImage: {
    width: 72,
    height: 72,
  },
  docHash: {
    fontSize: 7,
    color: colors.gray,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 10,
  },

  // ── TWO COLUMN SECTION ──
  twoCol: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── TABLE ROWS ──
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 5,
  },
  tableLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  tableValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    flex: 1,
    textAlign: 'right',
  },
  tableValueOrange: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.orange,
    flex: 1,
    textAlign: 'right',
  },

  // ── TEAM TABLE ──
  teamSection: {
    marginBottom: 12,
  },
  teamTableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  teamTableHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  teamRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  teamCell: {
    fontSize: 8,
    color: colors.navy,
  },
  teamCertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  // styles ga qo'shing
  certCheck: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 2,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certUncheck: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 2,
  },

  // ── BOTTOM TWO COL ──
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: colors.navy,
    marginRight: 7,
  },
  checklistText: {
    fontSize: 8,
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  blitzBox: {
    backgroundColor: colors.lightOrange,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
    padding: 10,
  },
  blitzTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.orange,
    letterSpacing: 1,
    marginBottom: 8,
  },
  blitzQ: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  blitzA: {
    fontSize: 7.5,
    color: colors.navy,
    marginBottom: 8,
  },

  // ── SIGNATURES ──
  sigSection: {
    marginTop: 10,
  },
  sigTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigItem: {
    flex: 1,
    marginRight: 16,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.navy,
    marginBottom: 4,
  },
  sigRole: {
    fontSize: 7,
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sigName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
  },
});

const defaultData = {
  title: 'INDUSTRIAL ARCHITECT CMS',
  subtitle: 'UNIT 04 CONTROL • PRIMARY GRID',
  permitNumber: 'WORK PERMIT #PTW-2023-08942',
  docHash: 'DOCUMENT HASH: 4F2A-9X77-L10',
  workOrder: [
    { label: 'PRIORITY', value: 'HIGH / IMMEDIATE', highlight: true },
    { label: 'VALID FROM', value: '24 OCT 2023 08:00' },
    { label: 'VALID UNTIL', value: '24 OCT 2023 20:00' },
    { label: 'SCOPE', value: 'HV TRANSFORMER MAINTENANCE & FLUID CHECK' },
  ],
  equipment: [
    { label: 'ASSET ID', value: 'U04-TR-0012' },
    { label: 'LOCATION', value: 'SUBSTATION ALPHA - SECTOR 4' },
    { label: 'VOLTAGE CLASS', value: '400 KV' },
    { label: 'COOLING SYSTEM', value: 'ONAF (FORCED AIR)' },
  ],
  team: [
    { name: 'M. J. Petrovich (ID: 4421)', role: 'Lead Electrician', cert: true },
    { name: 'S. O. Kostic (ID: 9012)', role: 'Safety Observer', cert: true },
    { name: 'A. R. Miller (ID: 1104)', role: 'HV Technician', cert: true },
  ],
  checklist: [
    'LOTO (LOCK OUT TAG OUT) VERIFIED',
    'ARC FLASH PPE CONFIRMED',
    'EARTHING STICKS GROUNDED',
    'EXCLUSION ZONE BARRIERS SET',
  ],
  blitzQuestions: [
    { q: 'Q1: IS THE BACKUP GENERATOR ISOLATED?', a: 'YES [ ]   NO [ ]' },
    { q: 'Q2: LAST CALIBRATION OF GAS MONITOR?', a: '' },
    { q: 'Q3: ANY HAZARDOUS WEATHER PREDICTED?', a: 'YES [ ]   NO [ ]' },
  ],
  signatures: [
    { role: 'SAFETY CONTROLLER', name: 'H. VARGAS' },
    { role: 'CHTS REP.', name: 'K. IVANOV' },
    { role: 'PROJECT SUPERVISOR', name: 'L. CHEN' },
    { role: 'PLANT MANAGER', name: 'D. FOSTER' },
  ],
  qrCode: null,
};

export default function MyDocument({ data = defaultData }) {
  const d = {
    title: data?.title ?? defaultData.title,
    subtitle: data?.subtitle ?? defaultData.subtitle,
    permitNumber: data?.permitNumber ?? defaultData.permitNumber,
    docHash: data?.docHash ?? defaultData.docHash,
    workOrder: data?.workOrder ?? defaultData.workOrder,
    equipment: data?.equipment ?? defaultData.equipment,
    team: data?.team ?? defaultData.team,
    checklist: data?.checklist ?? defaultData.checklist,
    blitzQuestions: data?.blitzQuestions ?? defaultData.blitzQuestions,
    signatures: data?.signatures ?? defaultData.signatures,
    qrCode: data?.qrCode ?? null,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.mainTitle}>{d.title}</Text>
            <Text style={styles.subTitle}>{d.subtitle}</Text>
            <Text style={styles.permitBadge}>{d.permitNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            {d.qrCode && <Image src={d.qrCode} style={styles.qrImage} />}
            <Text style={styles.docHash}>{d.docHash}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── WORK ORDER + EQUIPMENT ── */}
        <View style={styles.twoCol}>
          {/* Work Order */}
          <View style={styles.col}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WORK ORDER DETAILS</Text>
            </View>
            {d.workOrder.map((row, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.tableLabel}>{row.label}</Text>
                <Text style={row.highlight ? styles.tableValueOrange : styles.tableValue}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Equipment */}
          <View style={styles.col}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>EQUIPMENT INFO</Text>
            </View>
            {d.equipment.map((row, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.tableLabel}>{row.label}</Text>
                <Text style={styles.tableValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ASSIGNED TEAM ── */}
        <View style={styles.teamSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ASSIGNED TEAM</Text>
          </View>
          <View style={styles.teamTableHeader}>
            <Text style={[styles.teamTableHeaderText, { flex: 2 }]}>NAME / BADGE</Text>
            <Text style={[styles.teamTableHeaderText, { flex: 1.5 }]}>ROLE</Text>
            <Text style={[styles.teamTableHeaderText, { flex: 0.8, textAlign: 'right' }]}>
              SAFETY CERT.
            </Text>
          </View>
          {d.team.map((member, i) => (
            <View style={styles.teamRow} key={i}>
              <Text style={[styles.teamCell, { flex: 2 }]}>{member.name}</Text>
              <Text style={[styles.teamCell, { flex: 1.5, color: colors.gray }]}>
                {member.role}
              </Text>
              // team row ichida
              <View style={[{ flex: 0.8, alignItems: 'flex-end' }]}>
                {member.cert ? (
                  <View style={styles.certCheck}>
                    <Svg width="8" height="8" viewBox="0 0 10 10">
                      <Path
                        d="M1.5 5 L4 7.5 L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </Svg>
                  </View>
                ) : (
                  <View style={styles.certUncheck} />
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* ── CHECKLIST + BLITZ ── */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>SAFETY RULES CHECKLIST</Text>
            <View style={{ marginTop: 8 }}>
              {d.checklist.map((item, i) => (
                <View style={styles.checklistItem} key={i}>
                  <View style={styles.checkbox} />
                  <Text style={styles.checklistText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.col}>
            <Text style={[styles.sectionTitle, { color: colors.orange }]}>
              'BLITZ' SAFETY QUESTIONS
            </Text>
            <View style={[styles.blitzBox, { marginTop: 8 }]}>
              {d.blitzQuestions.map((bq, i) => (
                <View key={i}>
                  <Text style={styles.blitzQ}>{bq.q}</Text>
                  {bq.a ? (
                    <Text style={styles.blitzA}>{bq.a}</Text>
                  ) : (
                    <View style={{ marginBottom: 8 }} />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── SIGNATURES ── */}
        <View style={styles.sigSection}>
          <Text style={styles.sigTitle}>AUTHORIZATION & VERIFICATION</Text>
          <View style={styles.sigRow}>
            {d.signatures.map((sig, i) => (
              <View style={styles.sigItem} key={i}>
                <View style={styles.sigLine} />
                <Text style={styles.sigRole}>{sig.role}</Text>
                <Text style={styles.sigName}>{sig.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
