import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const ModalReceiverConfirmData = ({
  isOpenReceiverConfirmData,
  showSuccessScreenReceiverConfirmData,
  closeModalReceiverConfirmData,
  selectedNegotiationReceiverConfirmData,
  actionTypeReceiverConfirmData,
  handleSubmit,
  loadingReceiverConfirmData,
  errorReceiverConfirmData,
  successReceiverConfirmData,
}) => {
  const isConfirm = actionTypeReceiverConfirmData === 'confirm';
  const actionLabel = isConfirm
    ? 'Confirmar Disponibilidade'
    : 'Recusar Disponibilidade';

  if (!isOpenReceiverConfirmData) return null;

  const trip = selectedNegotiationReceiverConfirmData?.trip;
  const origem = trip?.cidade_origem || trip?.de;
  const destino = trip?.cidade_destino || trip?.para;

  return (
    <Modal
      visible={isOpenReceiverConfirmData}
      transparent
      animationType="fade"
      onRequestClose={closeModalReceiverConfirmData}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={closeModalReceiverConfirmData}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.headerTitle}>
              {isConfirm
                ? 'Confirmar Disponibilidade'
                : 'Recusar Disponibilidade'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {showSuccessScreenReceiverConfirmData ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>IconeCheck</Text>

                <Text style={styles.successTitle}>
                  Ação realizada com sucesso
                </Text>

                <Text style={styles.successText}>
                  {successReceiverConfirmData}
                </Text>

                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={closeModalReceiverConfirmData}
                >
                  <Text style={styles.btnGhostText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {trip && (
                  <Text style={styles.tripInfo}>
                    <Text style={styles.boldText}>Viagem: </Text>
                    {origem} → {destino}
                  </Text>
                )}

                <View
                  style={[
                    styles.confirmBox,
                    isConfirm ? styles.confirmBoxGreen : styles.confirmBoxOrange,
                  ]}
                >
                  <Text style={styles.confirmIcon}>{isConfirm ? '✅' : '⚠️'}</Text>

                  <View style={styles.confirmContent}>
                    <Text style={styles.boxTitle}>
                      {isConfirm
                        ? 'Confirmar disponibilidade'
                        : 'Recusar disponibilidade'}
                    </Text>

                    <Text style={styles.boxDescription}>
                      {isConfirm
                        ? 'Deseja confirmar que você está disponível para receber esta encomenda?'
                        : 'Deseja recusar a sua disponibilidade para receber esta encomenda?'}
                    </Text>
                  </View>
                </View>

                {!!errorReceiverConfirmData && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      {errorReceiverConfirmData}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnGhost]}
                    onPress={closeModalReceiverConfirmData}
                    disabled={loadingReceiverConfirmData}
                  >
                    <Text style={styles.btnGhostText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isConfirm ? styles.btnPrimary : styles.btnDanger,
                    ]}
                    onPress={handleSubmit}
                    disabled={loadingReceiverConfirmData}
                  >
                    {loadingReceiverConfirmData ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnPrimaryText}>{actionLabel}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalBody: {
    paddingVertical: 4,
  },
  tripInfo: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
  },
  confirmBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  confirmBoxGreen: {
    backgroundColor: '#e6f7ed',
    borderColor: '#a3e6be',
    borderWidth: 1,
  },
  confirmBoxOrange: {
    backgroundColor: '#fff7e6',
    borderColor: '#ffd591',
    borderWidth: 1,
  },
  confirmIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  confirmContent: {
    flex: 1,
  },
  boxTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  boxDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 60,
    color: '#2e7d32',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  btnGhost: {
    backgroundColor: '#f5f5f5',
  },
  btnGhostText: {
    color: '#555',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#1cb5e0',
  },
  btnDanger: {
    backgroundColor: '#d32f2f',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ModalReceiverConfirmData;