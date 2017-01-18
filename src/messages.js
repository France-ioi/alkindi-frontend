
export const messages = {
  'already in a team': "Vous êtes déjà dans une équipe.",
  'not qualified for any round': "Vous n'êtes pas qualifié.",
  'unknown access code': "Le code d'accès saisi n'est pas valide.",
  'unknown team code': "Le code d'équipe saisi n'est pas valide.",
  'team is locked': "L'équipe a déjà commencé une épreuve, il n'est plus possible de la quitter.",
  'team is closed': "Le créateur de l'équipe a verrouillé la composition de l'équipe.",
  'registration is closed': "L'enregistrement pour ce tour n'est pas encore ouvert.",
  'already have a task': "Votre équipe a déjà accès au sujet.",
  'training is not open': "L'épreuve n'est pas encore ouverte.",
  'unknown qualification code': "Le code de qualification que vous avez entré est incorrect.",
  'must pass training': "Votre équipe a déjà commencé une tentative.",
  'too soon': "Soumission rejetée : trop de soumissions en moins d'une minute.",
  'invalid input': "Le format de votre réponse est invalide.",
  'attempt is closed': "L'épreuve en temps limité est terminée, vous ne pouvez plus soumettre.",
  'too many attempts': "Vous avez atteint le nombre maximum de tentatives en temps limité.",
  'team too large': "L'équipe a déjà le nombre maximum de membres et ne peut plus en accepter.",
  'not enough qualified members': "Vous ne pouvez pas rejoindre l'équipe car elle n'aurait plus assez de membres qualifiés.",
  'server error': "Le serveur n'a pas pu être contacté, merci de ré-essayer dans quelques minutes.",
  'update failed': "Votre session a probablement expirée, rechargez la page pour vous reconnecter.",
  'bad qualification code': "Ce code de qualification est invalide.",
  'used qualification code': "Ce code de qualification est rattaché à un autre utilisateur.",
  'invalid user': "L'identifiant d'utilisateur est invalide.",
  'already qualified': "Vous êtes déjà qualifié avec un autre code.",
  'unexpected': "Une erreur imprévue s'est produite, n'hésitez pas à nous contacter.",
  'registration is closed': "La période d'enregistrement est fermée.",
  'attempt too soon': "Vous devez attendre 5 minutes entre la création de 2 tentatives.",
  'timed attempt in progress': "Terminez la tentative en cours avant d’en commencer une nouvelle."
};

export default function (key) {
  return messages[key] || key;
};
