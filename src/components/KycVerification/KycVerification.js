import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ShieldCheck,
  ScanFace,
  Lock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';

export const KycVerification = ({ onOpenWarning, loading = false }) => {
  return (
    <View style={styles.kycContainer}>
      <View style={styles.kycHeaderRow}>
        <View style={styles.kycIconBox}>
          <ShieldCheck size={28} color="#ffffff" strokeWidth={2.2} />
        </View>
        <Text style={styles.kycTitle}>Verificação de identidade</Text>
      </View>

      <Text style={styles.kycDescription}>
        Para garantir a segurança da plataforma, precisamos confirmar sua
        identidade antes de liberar o pagamento.
      </Text>

      <View style={styles.kycBenefits}>
        <View style={styles.kycBenefit}>
          <ScanFace size={22} color="#2563eb" />
          <Text style={styles.kycBenefitText}>Reconhecimento facial seguro</Text>
        </View>

        <View style={styles.kycBenefit}>
          <Lock size={20} color="#2563eb" />
          <Text style={styles.kycBenefitText}>Seus dados são protegidos</Text>
        </View>

        <View style={styles.kycBenefit}>
          <CheckCircle2 size={20} color="#2563eb" />
          <Text style={styles.kycBenefitText}>Processo rápido e confiável</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.kycButton, loading && styles.kycButtonDisabled]}
        onPress={onOpenWarning}
        disabled={loading}
      >
        <Text style={styles.kycButtonText}>
          {loading ? 'Verificando...' : 'Verificar'}
        </Text>
        {!loading && <ArrowRight size={20} color="#ffffff" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  kycContainer: {
    width: '100%',
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 10,
  },
  kycHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    gap: 10,
    marginBottom: 12,
  },
  kycIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  kycTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    flexShrink: 1,
  },
  kycDescription: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  kycBenefits: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  kycBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kycBenefitText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
  kycButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  kycButtonDisabled: {
    opacity: 0.7,
  },
  kycButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});