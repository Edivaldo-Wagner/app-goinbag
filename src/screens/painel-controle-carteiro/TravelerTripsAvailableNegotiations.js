import React, {useState, useCallback} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './PainelCarteiro.styles';
import UseViagensCarteiro from '../../hooks/UseViagens/UseViagensCarteiro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default function ViagensDisponibilizadas({
  viagensDisponibilizadasCarteiro,
  erroDisponibilizadas,
  redirectEditarViagem,
  handleModalExcluirViagemDisponibilizadas,
}) {
  const {height, width} = useWindowDimensions();
  const [fastest, setFastest] = useState(true);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  /*const {
    Disponibilizadas,
    loadingDisponibilizadas,
    erroDisponibilizadas,
    buscarDisponibilizadas
  } = UseViagensCarteiro();*/

  const availableWidthNoRaio = width - 68;
  const avatarWidthNoRaio = 52;

  let iconSizeNoRaio = 20;
  let iconTextSizeNoRaio = 12;
  let iconBoxWidthNoRaio = 70;

  if (width < 350) {
    iconSizeNoRaio = 16;
    iconTextSizeNoRaio = 10;
    iconBoxWidthNoRaio = 55;
  } else if (width < 450) {
    iconSizeNoRaio = 18;
    iconTextSizeNoRaio = 11;
    iconBoxWidthNoRaio = 50;
  }

  const totalIconsWidthNoRaio = iconBoxWidthNoRaio * 3 + 8 * 2;
  const userInfoMaxWidthNoRaio =
    availableWidthNoRaio - avatarWidthNoRaio - totalIconsWidthNoRaio - 10;
  const isSmallScreenNoRaio = width < 400;

  const getTransporteViagensDisponibilizadas = tipo => {
    let normalizedTipo = (tipo || '')
      .normalize('NFD') // separa acentos das letras
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase(); // deixa tudo minúsculo

    switch (normalizedTipo) {
      case 'aviao':
        return {name: 'flight', label: 'Avião'};
      case 'onibus':
        return {name: 'directions-bus', label: 'Ônibus'};
      case 'carro':
        return {name: 'directions-car', label: 'Carro'};
      case 'moto':
        return {name: 'two-wheeler', label: 'Moto'};
      case 'trem':
        return {name: 'train', label: 'Trem'};
      default:
        return {name: 'help', label: 'Desconhecido'};
    }
  };

  const getStatusBtnsCardsViagensDisponibilizadas = (tipo, serie_viagem) => {
    let normalizedTipo = (tipo || '')
      .normalize('NFD') // separa acentos das letras
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase(); // deixa tudo minúsculo

    switch (normalizedTipo || '') {
      case 'aviao':
        return {
          accao_necessaria_viagens_disponibilizadas:
            'Status: Aguardando Cliente',
          btns_viagens_disponibilizadas: [
            <View
              key="btn1"
              style={[
                styles.containerButtonCard,
                {marginTop: 9, marginBottom: -10},
              ]}>
              <TouchableOpacity
                onPress={() => redirectEditarViagem(serie_viagem)}
                style={[
                  styles.buttonCard,
                  {backgroundColor: 'rgba(228, 161, 27, 0.2)'},
                ]}>
                <Text
                  style={[
                    styles.buttonTextCard,
                    {
                      color: 'rgba(143, 95, 6, 0.8)',
                      fontFamily: 'Montserrat-Bold',
                    },
                  ]}>
                  Editar Trajeto
                </Text>
              </TouchableOpacity>
            </View>,
          ],
        };
      case 'onibus':
      case 'carro':
      case 'moto':
      case 'trem':
        return {
          accao_necessaria_viagens_disponibilizadas:
            'Status: Aguardando Cliente',
          btns_viagens_disponibilizadas: [
            <View
              key="btn1"
              style={[
                styles.containerButtonCard,
                {marginTop: 9, marginBottom: 0},
              ]}>
              <TouchableOpacity
                onPress={() => redirectEditarViagem(serie_viagem)}
                style={[
                  styles.buttonCard,
                  {backgroundColor: 'rgba(228, 161, 27, 0.2)'},
                ]}>
                <Text
                  style={[
                    styles.buttonTextCard,
                    {
                      color: 'rgba(143, 95, 6, 0.8)',
                      fontFamily: 'Montserrat-Bold',
                    },
                  ]}>
                  Editar Trajeto
                </Text>
              </TouchableOpacity>
            </View>,
            /*<View key="btn2" style={[styles.containerButtonCard, { marginTop: 10, marginBottom: -10 }]}>
              <TouchableOpacity onPress={() => redirectEditarViagem(serie_viagem, true)} style={[styles.buttonCard, { backgroundColor: 'rgba(228, 161, 27, 0.2)' }]}>
                <Text style={[styles.buttonTextCard, { color: 'rgba(143, 95, 6, 0.8)', fontFamily: 'Montserrat-Bold' }]}>Editar Cidades no Trajeto</Text>
              </TouchableOpacity>
            </View>,*/
          ],
        };
      default:
        return {
          accao_necessaria_viagens_disponibilizadas: 'Status desconhecido',
          btns_viagens_disponibilizadas: [],
        };
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  return (
    <>
      <View>
        {viagensDisponibilizadasCarteiro.map((viagem, index) => {
          const transporteNoRaio = getTransporteViagensDisponibilizadas(
            viagem.meio_transporte === 'Avião'
              ? 'aviao'
              : viagem.meio_transporte,
          );

          const statusBtnsViagensDisponibilizadas =
            getStatusBtnsCardsViagensDisponibilizadas(
              viagem.meio_transporte,
              viagem.serie_viagem,
            );

          return (
            <View key={index} style={styles.card}>
              {/* ORIGEM / DESTINO */}
              <View style={styles.origemDestino}>
                <View style={styles.cidade}>
                  <Text style={styles.cidadeTitulo} numberOfLines={1}>
                    {viagem.cidade_de_onde_vai_sair}
                  </Text>
                  <Text style={styles.cidadeData} numberOfLines={1}>
                    {viagem.data_partida_para_busca} às {viagem.hora_partida}
                  </Text>
                </View>

                <Text style={styles.separador}>•••</Text>

                <View style={[styles.cidade, {alignItems: 'flex-end'}]}>
                  <Text style={styles.cidadeTitulo} numberOfLines={1}>
                    {viagem.cidade_para_onde_vai}
                  </Text>
                  <Text style={styles.cidadeData} numberOfLines={1}>
                    {viagem.data_chegada_para_busca} às {viagem.hora_chegada}
                  </Text>
                </View>
              </View>

              {/* USUÁRIO + ICONES */}
              <View style={styles.usuarioLinha}>
                <View style={styles.usuario}>
                  <Image
                    key={avatarVersion}
                    source={{
                      uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${viagem.serie_estrangeira_carteiro}/img.png?v=${avatarVersion}`,
                      cache: 'reload',
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.nomeUsuario} numberOfLines={1}>
                      {viagem.nome_carteiro}
                    </Text>
                    <Text style={styles.subUsuario}>Carteiro</Text>
                  </View>
                </View>

                <View style={styles.infoTransporte}>
                  {[
                    transporteNoRaio,
                    {name: 'schedule', label: viagem.total_horas},
                    {name: 'work', label: 'Mala P'},
                  ].map((item, i) => (
                    <View key={i} style={styles.cardInfo}>
                      <MaterialIcons
                        name={item.name}
                        size={18}
                        color="#0090e8"
                        style={{marginTop: 5}}
                      />
                      <Text style={styles.cardInfoText} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* STATUS + FECHAR */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 15,
                }}>
                <View style={{flexDirection: 'row', marginBottom: 10}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Montserrat-Bold',
                      color: '#8f5f06',
                    }}>
                    Status:
                  </Text>
                  <Text style={styles.typeStatusCard}>
                    {
                      statusBtnsViagensDisponibilizadas.accao_necessaria_viagens_disponibilizadas
                    }
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    width: 30,
                    height: 30,
                    marginTop: -10,
                    marginLeft: '-2%',
                    backgroundColor: '#b20d26',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                  }}
                  onPress={() =>
                    handleModalExcluirViagemDisponibilizadas(
                      viagem.serie_viagem,
                    )
                  }>
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* BOTÕES */}
              <View style={styles.areaBotoes}>
                {statusBtnsViagensDisponibilizadas.btns_viagens_disponibilizadas.map(
                  (btn, i) => (
                    <View key={i} style={styles.botaoWrapper}>
                      {btn}
                    </View>
                  ),
                )}
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}
