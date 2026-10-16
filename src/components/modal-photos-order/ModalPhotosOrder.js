import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { CheckCircle2, Image as ImageIcon } from 'lucide-react-native';
import placeholderImage from '../../assets/images/no-photo.jpg';

const ModalPhotosOrder = ({
  isOpenPhotosOrder,
  closePhotosOrderModal,
  showSuccessScreenPhotosOrder,
  selectedNegotiationPhotosOrder,
  photosPhotosOrder,
  modePhotosOrder,
  loadingPhotosOrder,
  errorPhotosOrder,
  successPhotosOrder,
  handlePhotoChange,
  handleSubmit,
}) => {
  const isUploadMode = modePhotosOrder === 'upload';
  const isConfirmMode = modePhotosOrder === 'confirm';
  const uploadLocked = Boolean(selectedNegotiationPhotosOrder?.photos_locked);

  const getTitle = () => {
    if (isUploadMode && !uploadLocked) return 'Inserir fotografias';
    if (isUploadMode && uploadLocked) return 'Verificar fotografias';
    return 'Confirmar fotografias';
  };

  return (
    <Modal
      visible={isOpenPhotosOrder}
      transparent
      animationType="fade"
      onRequestClose={closePhotosOrderModal}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={closePhotosOrderModal}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <View style={styles.divider} />

            {showSuccessScreenPhotosOrder ? (
              <View style={styles.successContainer}>
                <CheckCircle2 size={80} color="#10B981" />
                <Text style={styles.successTitle}>Ação realizada com sucesso</Text>
                <Text style={styles.successSubtitle}>
                  {successPhotosOrder || 'Operação concluída com êxito.'}
                </Text>

                <TouchableOpacity
                  style={styles.btnGhostFull}
                  onPress={closePhotosOrderModal}
                >
                  <Text style={styles.btnGhostText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {selectedNegotiationPhotosOrder?.trip && (
                  <Text style={styles.tripText}>
                    <Text style={{ fontWeight: 'bold' }}>Viagem: </Text>
                    {selectedNegotiationPhotosOrder.trip?.cidade_origem ||
                      selectedNegotiationPhotosOrder.trip?.de}{' '}
                    →{' '}
                    {selectedNegotiationPhotosOrder.trip?.cidade_destino ||
                      selectedNegotiationPhotosOrder.trip?.para}
                  </Text>
                )}

                {/* Grid de 4 Fotos */}
                <View style={styles.photosGrid}>
                  {photosPhotosOrder.map((item, index) => {
                    // Verifica se o item possui um preview válido em string (URL ou base64)
                    const hasValidUri =
                      typeof item.preview === 'string' &&
                      item.preview.trim() !== '' &&
                      !item.preview.includes('vecteezy'); // ignora a url antiga se estiver salva no estado

                    const imageSource = item.file
                      ? { uri: item.file.uri }
                      : hasValidUri
                      ? { uri: item.preview }
                      : placeholderImage;

                    return (
                      <View style={styles.photoSlot} key={index}>
                        <Image
                          source={imageSource}
                          style={[
                            styles.photoPreview,
                            !hasValidUri && !item.file && styles.placeholderStyle,
                          ]}
                          resizeMode={
                            hasValidUri || item.file ? 'cover' : 'contain'
                          }
                        />
                        {isUploadMode && !uploadLocked && (
                          <TouchableOpacity
                            style={styles.uploadBtn}
                            onPress={() => handlePhotoChange(index)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.uploadBtnText}>Upload</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>

                {isConfirmMode && (
                  <View style={styles.infoBlock}>
                    <Text style={styles.infoBlockText}>
                      Confirmo que tenho ciência do conteúdo que estou levando e
                      tive a oportunidade de abrir e analisar a encomenda antes de
                      aceitar levar.
                    </Text>
                  </View>
                )}

                {Boolean(errorPhotosOrder) && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{errorPhotosOrder}</Text>
                  </View>
                )}

                {/* Botões de Ação */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.btnGhost}
                    onPress={closePhotosOrderModal}
                    disabled={loadingPhotosOrder}
                  >
                    <Text style={styles.btnGhostText}>Cancelar</Text>
                  </TouchableOpacity>

                  {((isUploadMode && !uploadLocked) || isConfirmMode) && (
                    <TouchableOpacity
                      style={styles.btnSave}
                      onPress={handleSubmit}
                      disabled={loadingPhotosOrder}
                    >
                      {loadingPhotosOrder ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.btnSaveText}>
                          {isUploadMode ? 'Inserir' : 'Confirmar fotografias'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00B4D8',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 3,
    backgroundColor: '#00B4D8',
    width: '100%',
    marginBottom: 20,
    borderRadius: 2,
  },
  tripText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 24,
  },
  photoSlot: {
    width: '47%',
    height: 120,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  placeholderStyle: {
    width: '60%',
    height: '60%',
  },
  uploadBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#2A2F3D',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  uploadBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoBlock: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoBlockText: {
    color: '#1D4ED8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#C81E1E',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  btnGhost: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D0E3F5',
    backgroundColor: '#F4F8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGhostFull: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0E3F5',
    backgroundColor: '#F4F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  btnGhostText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0084FF',
  },
  btnSave: {
    flex: 1.2,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default ModalPhotosOrder;