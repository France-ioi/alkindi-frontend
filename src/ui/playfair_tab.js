import React from 'react';
import {connect} from 'react-redux';

import {PureComponent} from '../misc';
import PlayFair from '../playfair';
import {makeAlphabet} from '../playfair/utils/cell';

const selector = function (state) {
  const {task} = state;
  return {task};
};

// Temporary mostly fetched from server.
const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ');
const cipheredText = "KQ CVG XSVR ACHZ JDSKQ CBAVHM, AKV TKMV QKAONPXTP, OD CSACQ MT ZTAZQ BONP NI MQUGQTN. BSPV QKAIHVACBQZ, PTSC PCDSVCQZTPL ICKLNADVC PVQ MCK TIEUTQQTYV KCQVTQCK MQ OD YLIVTQFZ. QKKQ KC QNSPZC IDVO PV HTCAF PDNMQ ZMGUKQ. NSSC KQ QNSPZCZQN MP CZQPAT FAVT DZCVPT MPASAZT NLYVCVPXLS. NSSC O FNLSUQZMH HQIPTSGB MQ ALISZMPAO I NSSC MQ TJDVQ KT QVD. OTBV O JFVFTMQV DS RSPY CIPQ OT ZHIQZL AG UYN TQ OD TSDHAVDJYLR AS IDITZIO. TSJZZM FT AKMQ MQ EUJCQXMZTZA P'CKA OIO TJAC OTBV KQO VKALBCK, MF KQO IM CQVACC IJ-ICKYLSC, TZ KQC IUMJGQXNPQ A'PVT MPCZQ ADVAQZT. FT FLAT ZQ MSAQ TP NSIPV TIK CQNFZ TFVDA TB IVUBSHGT M PV CAQZYV. CSVUMH OD BNSTQMBVC KSVNIPAT : FTPZCNQVCKCR KCK KQFNQNCK MQ NSQNT HZQPTA DZCT I TJAC PV, G QDJQ ACHZ, FQF TQ IHOQAUSDMH KQO CSPQTY. CDJQTY ST HNLIBAC IB PTDHZQ LPQTVP TQ MQ UVXPA-PCHE TQ NTQNDVTKMR MJV-ZTGC. KQ ZQCSOQNA LPQTVP KCND NSQNT FKQ. OTBV SLTISDKCB QQ HYN, BNTZRBQ KF HNDRA PTDHZQ IV MQYVYLSC TQ K YSPOCNDDVT CPIQNC-ZAVPF-CBAVHM. KQ ZQCSOQNA LPQTVP ALAC TQZQ IJUVKC ONV XTAZQ QST. FQKD ITPZT IVRT EUJCQXCK, KQL ICHN GZQAJQZY CLNZMPA KQ VPZMNL MQ PLR, YCK IPQNCK KQ TSMQ IB TIMQPNYV. \n254292628";
const initialHintsGrid = [
  [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
  [{q:'unknown'}, {l:11, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l:10, q:'hint'}],
  [{q:'unknown'}, {l:16, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l: 4, q:'hint'}],
  [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
  [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
];
const initialTask = {
  score: 500,
  alphabet: alphabet,
  cipheredText: cipheredText,
  hintsGrid: initialHintsGrid
};
const initialToolStates = [
  // TextInput
  {
    outputVariable: "texteChiffré"
  },
  // Hints
  {
    outputGridVariable: "lettresGrilleIndices"
  },
  // SubstitutionFromGrid
  {
    editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
    inputGridVariable: 'lettresGrilleIndices',
    outputGridVariable: 'lettresGrilleEditée',
    outputSubstitutionVariable: 'substitutionGénérée'
  },
  // EditSubstitution
  {
    nbLettersPerRow: 29,
    inputCipheredTextVariable: 'texteChiffré',
    inputSubstitutionVariable: 'substitutionGénérée',
    outputSubstitutionVariable: 'substitutionÉditée',
    substitutionEdits: []
  },
  // BigramFrequencyAnalysis
  {
    inputCipheredTextVariable: 'texteChiffré',
    inputSubstitutionVariable: 'substitutionÉditée',
    outputSubstitutionVariable: 'substitutionFréquences',
    substitutionEdits: [],
    editable: false
  },
  // ApplySubstitution
  {
    nbLettersPerRow: 29,
    inputTextVariable: 'texteChiffré',
    inputSubstitutionVariable: 'substitutionÉditée',
    outputTextVariable: 'texteDéchiffré'
  }
];

const PlayFairTab = PureComponent(self => {

  const getQueryCost = function (query) {
    if (query.type === "grid")
      return 10;
    if (query.type === "alphabet")
      return 10;
    return 0;
  };

  const getHint = function (query, callback) {
    callback('not implemented');
  };

  const setToolState = function (id, data) {
    alert('not implemented');
  };

  self.render = function () {
    const taskApi = {...initialTask, getQueryCost, getHint};
    return (
      <PlayFair task={taskApi} toolStates={initialToolStates} setToolState={setToolState}/>
    );
  };

});

export default connect(selector)(PlayFairTab);
