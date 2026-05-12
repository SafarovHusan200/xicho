import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },

  title: {
    fontSize: 24,
    marginBottom: 20,
  },

  section: {
    marginBottom: 10,
  },

  label: {
    fontSize: 10,
    color: '#555',
    marginBottom: 4,
  },

  value: {
    fontSize: 12,
    marginBottom: 8,
  },
});

const defaultData = {
  title: 'Salom PDF',
  rows: [
    { label: 'Dokument', value: 'Bu Next.js ichida yaratilgan PDF.' },
    { label: 'Izoh', value: 'React orqali PDF render qilinyapti.' },
  ],
};

export default function MyDocument({ data = defaultData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>

        {data.rows.map((row, index) => (
          <View style={styles.section} key={index}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
