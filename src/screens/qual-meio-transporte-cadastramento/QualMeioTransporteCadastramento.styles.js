import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0eded',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#f0eded',
  },
  titleText: {
    marginTop: 0,
    textAlign: 'center',
    color: 'rgb(0, 186, 212)',
    fontSize: 20,
    lineHeight: 38,
    fontFamily: 'Montserrat-Bold',
    paddingHorizontal: 10,
  },
  cardsGrid: {
    marginTop: 30,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  box: {
    width: 145,
    height: 145,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  boxInternal: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxSelecionado: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  label: {
    position: 'absolute',
    top: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(0, 186, 212, 0.8)',
    fontFamily: 'Montserrat-Regular',
  },
  imageContainer: {
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
