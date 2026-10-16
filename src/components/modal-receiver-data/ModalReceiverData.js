import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';

import {
  CheckCircle2,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react-native';

const placeholderImage =
  'https://www.kitshouse.org/wp-content/uploads/2019/09/no-image-1.jpg';

const ModalReceiverData = ({
  isClient = false,
  isOpenReceiverData,
  showSuccessScreenReceiverData,
  closeModalReceiverData,
  formDataReceiverData,
  handleChange,
  handlePhoneChange,
  handleBlur,
  handleSubmit,
  loadingReceiverData,
  selectedNegotiationReceiverData,
  errorsReceiverData,
  errorReceiverData,
}) => {
  const isReceiverLocked = Boolean(
    selectedNegotiationReceiverData?.receiver_data_locked
  );

  const shouldLockFields = !isClient && isReceiverLocked;

  return (
    <Modal
      visible={isOpenReceiverData}
      transparent
      animationType="fade"
      onRequestClose={closeModalReceiverData}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={closeModalReceiverData}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {isClient ? (
              <View>
                <Text style={styles.modalTitle}>Dados do Destinatário</Text>
                <View style={styles.divider} />

                {showSuccessScreenReceiverData ? (
                  <View style={styles.successContainer}>
                    <CheckCircle2 size={80} color="#10B981" />
                    <Text style={styles.successTitle}>
                      Destinatário adicionado com sucesso
                    </Text>
                    <Text style={styles.successSubtitle}>
                      O destinatário será notificado por e-mail com os dados enviados.
                    </Text>

                    <TouchableOpacity
                      style={[styles.btnGhost, { width: '100%' }]}
                      onPress={closeModalReceiverData}
                    >
                      <Text style={styles.btnGhostText}>Entendi</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {selectedNegotiationReceiverData?.trip && (
                      <Text style={styles.tripText}>
                        <Text style={{ fontWeight: 'bold' }}>Viagem: </Text>
                        {selectedNegotiationReceiverData.trip?.cidade_origem ||
                          selectedNegotiationReceiverData.trip?.de}{' '}
                        →{' '}
                        {selectedNegotiationReceiverData.trip?.cidade_destino ||
                          selectedNegotiationReceiverData.trip?.para}
                      </Text>
                    )}

                    {Boolean(errorReceiverData) && (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>
                          {errorReceiverData}
                        </Text>
                      </View>
                    )}

                    {/* Nome */}
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Nome</Text>
                      <TextInput
                        style={[
                          styles.input,
                          Boolean(errorsReceiverData?.name) && styles.inputError,
                        ]}
                        value={
                          formDataReceiverData?.name ||
                          formDataReceiverData?.temporary_receiver?.name ||
                          ''
                        }
                        onChangeText={(text) => handleChange('name', text)}
                        onBlur={() => handleBlur('name')}
                        editable={!shouldLockFields && !loadingReceiverData}
                        placeholder=""
                      />
                      {Boolean(errorsReceiverData?.name) && (
                        <Text style={styles.errorText}>
                          {errorsReceiverData.name}
                        </Text>
                      )}
                    </View>

                    {/* Email */}
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={[
                          styles.input,
                          Boolean(errorsReceiverData?.email) && styles.inputError,
                        ]}
                        value={
                          formDataReceiverData?.email ||
                          formDataReceiverData?.temporary_receiver?.email ||
                          ''
                        }
                        onChangeText={(text) => handleChange('email', text)}
                        onBlur={() => handleBlur('email')}
                        editable={!shouldLockFields && !loadingReceiverData}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder=""
                      />
                      {Boolean(errorsReceiverData?.email) && (
                        <Text style={styles.errorText}>
                          {errorsReceiverData.email}
                        </Text>
                      )}
                    </View>

                    {/* Telefone */}
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Telefone</Text>
                      <View
                        style={[
                          styles.phoneWrapper,
                          Boolean(errorsReceiverData?.phone) && styles.inputError,
                        ]}
                      >
                        <View style={styles.ddiBox}>
                          <Image
                            source={{ uri: 'https://flagcdn.com/w40/br.png' }}
                            style={styles.flag}
                          />
                          <Text style={styles.ddiText}>+55</Text>
                        </View>
                        <TextInput
                          style={styles.phoneInput}
                          value={
                            formDataReceiverData?.phone ||
                            formDataReceiverData?.temporary_receiver?.phone ||
                            ''
                          }
                          onChangeText={handlePhoneChange}
                          onBlur={() => handleBlur('phone')}
                          editable={!shouldLockFields && !loadingReceiverData}
                          keyboardType="phone-pad"
                          placeholder=""
                        />
                      </View>
                      {Boolean(errorsReceiverData?.phone) && (
                        <Text style={styles.errorText}>
                          {errorsReceiverData.phone}
                        </Text>
                      )}
                    </View>

                    {formDataReceiverData?.is_receiver_readded && (
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockText}>
                          Adicione novamente os dados do destinatário
                        </Text>
                      </View>
                    )}

                    {/* Botões de Ação */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.btnGhost}
                        onPress={closeModalReceiverData}
                        disabled={loadingReceiverData}
                      >
                        <Text style={styles.btnGhostText}>Cancelar</Text>
                      </TouchableOpacity>

                      {(!isReceiverLocked || isClient) && (
                        <TouchableOpacity
                          style={styles.btnSave}
                          onPress={handleSubmit}
                          disabled={loadingReceiverData}
                        >
                          {loadingReceiverData ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.btnSaveText}>
                              {isReceiverLocked
                                ? 'Alterar destinatário'
                                : 'Adicionar destinatário'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            ) : (
              /* Visão para não cliente */
              <View style={styles.profileCard}>
                {formDataReceiverData?.is_confirmed ? (
                  <>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={{
                          uri: formDataReceiverData?.img || placeholderImage,
                        }}
                        style={styles.avatarImage}
                      />
                    </View>

                    <Text style={styles.profileName}>
                      {formDataReceiverData?.name || ''}
                    </Text>
                    <Text style={styles.profileRole}>Destinatário verificado</Text>

                    <View style={styles.infoCardsContainer}>
                      <View style={styles.infoCard}>
                        <Mail size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Email</Text>
                          <Text style={styles.infoValue}>
                            {formDataReceiverData?.email || ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoCard}>
                        <Phone size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Telefone</Text>
                          <Text style={styles.infoValue}>
                            {formDataReceiverData?.phone || ''}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.btnGhost}
                      onPress={closeModalReceiverData}
                    >
                      <Text style={styles.btnGhostText}>Fechar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.successContainer}>
                    <AlertCircle size={80} color="#F59E0B" />
                    <Text style={styles.successTitle}>Destinatário indisponível</Text>
                    <Text style={styles.successSubtitle}>
                      Aguardando a confirmação do destinatário para esta viagem
                    </Text>

                    <TouchableOpacity
                      style={styles.btnGhost}
                      onPress={closeModalReceiverData}
                    >
                      <Text style={styles.btnGhostText}>Entendi</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '95%',
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
    fontWeight: '700',
    color: '#00B4D8',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 2,
    backgroundColor: '#00B4D8',
    width: '100%',
    marginBottom: 20,
  },
  tripText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4D8',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  phoneWrapper: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    paddingLeft: 6,
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ddiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
  },
  flag: {
    width: 20,
    height: 14,
    borderRadius: 2,
    marginRight: 6,
  },
  ddiText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    alignSelf: 'flex-start',
    marginLeft: 10,
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
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  btnGhost: {
    flex: 0.8, 
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D0E3F5',
    backgroundColor: '#F4F8FC',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
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
  profileCard: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileRole: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  infoCardsContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
});

export default ModalReceiverData;