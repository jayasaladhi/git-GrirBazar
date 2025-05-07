import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#A9D6E5',
  },
  card: {
    backgroundColor: '#FFD9C0',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2A6F97',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textWhite: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  listTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#00B383',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#D00000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
