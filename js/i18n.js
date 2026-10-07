/* ==========================================================================
   Talent de Demain FC — French / English
   --------------------------------------------------------------------------
   THE MARKUP IS IN FRENCH. That is deliberate: the club recruits families in
   Côte d'Ivoire, so French must be what search engines index and what a
   visitor without JavaScript reads. English is applied on request instead.

   The table below still reads english → french, because that is the order it
   was authored in; the runtime map is simply inverted from it. One table,
   two directions — there is no second list to keep in sync.

   This file MUST load before nav.js / main.js / pages.js: those scripts split
   headlines into per-letter spans and clone the nav links, and both need the
   final text. Switching language therefore reloads the page rather than
   re-translating a DOM that has already been transformed.
   ========================================================================== */

(function () {
  'use strict';

  /* Words that read the same in both languages, or must never be translated
     (club, sponsor, competition and people names) are simply absent below. */
  var FR = {
    /* ---- navigation & chrome ---- */
    'Home': 'Accueil',
    'Squads': 'Équipes',
    'Academy': 'Académie',
    'Events': 'Événements',
    'Community': 'Communauté',
    'Menu': 'Menu',
    'Primary': 'Principal',
    'Footer': 'Pied de page',
    'Talent de Demain FC, home': 'Talent de Demain FC, accueil',
    'Talent de Demain FC crest': 'Blason du Talent de Demain FC',
    'Join The Club': 'Rejoindre le club',
    'Official sponsor': 'Sponsor officiel',
    'Official sponsor:': 'Sponsor officiel :',
    '© 2026 Talent de Demain FC · EST. 2023': '© 2026 Talent de Demain FC · DEPUIS 2023',

    /* ---- landing ---- */
    'Talent de Demain FC · Forging Football Leaders':
      'Talent de Demain FC · Former les leaders du football',
    'Talent de Demain FC, the academy forging the football leaders of tomorrow.':
      'Talent de Demain FC, l\'académie qui forme les leaders du football de demain.',
    'Forging football': 'Former les',
    'leaders.': 'leaders du football.',
    'Join our legacy.': 'Rejoignez notre histoire.',
    'An academy built for the next generation. Your child is coached by demanding trainers and plays real matches, from the first touch of the ball to the first team.':
      'Une académie pensée pour la nouvelle génération. Votre enfant y est encadré par des entraîneurs exigeants et joue de vrais matchs, de sa première touche de balle jusqu\'à l\'équipe première.',
    'Explore Academy': 'Découvrir l\'académie',
    'Monochrome 2026': 'Monochrome 2026',
    'Liquid marble. Grey crew collar.': 'Marbré liquide. Col rond gris.',
    'Match-Grade Fabric': 'Tissu de compétition',
    'Breathable weave, built for intensity.': 'Maille respirante, conçue pour l\'intensité.',
    'The Number 1': 'Le numéro 1',
    'Worn by the next generation.': 'Porté par la nouvelle génération.',
    'Your Name Next': 'Votre nom ensuite',
    'Trials open for the 2026-27 season.': 'Détections ouvertes pour la saison 2026-27.',
    'Scroll': 'Défiler',
    'Rotation': 'Rotation',
    'Inside the club': 'Dans le club',
    'Talent de Demain FC players and staff during a training session':
      'Joueurs et encadrement du Talent de Demain FC pendant une séance',
    'Talent de Demain FC home jersey rotating':
      'Maillot du Talent de Demain FC en rotation',
    'Talent de Demain FC home jersey': 'Maillot du Talent de Demain FC',
    'The next generation starts here.': 'La nouvelle génération commence ici.',
    'We support every player from their first session to their first professional contract.':
      'Nous accompagnons chaque joueur de sa première séance jusqu\'à son premier contrat professionnel.',

    /* ---- squads ---- */
    'Squads · Talent de Demain FC': 'Équipes · Talent de Demain FC',
    'The squads of Talent de Demain FC: Formation A, Formation B, coaching staff and club leadership.':
      'Les équipes du Talent de Demain FC : Formation A, Formation B, encadrement et direction du club.',
    'The Club': 'Le club',
    'The club has three age groups: U-12, U-15 and U-19. All of them train and play with the same idea of football, brave and disciplined, where young talent gets its chance.':
      'Le club compte trois catégories : U-12, U-15 et U-19. Toutes s\'entraînent et jouent avec la même idée du football, courageuse et disciplinée, où les jeunes talents ont leur place.',
    'U-19 · first competitive squad': 'U-19 · première équipe compétitive',
    'U-12 development squad': 'Équipe de formation U-12',
    'Formation A photos': 'Photos de la Formation A',
    'Formation B photos': 'Photos de la Formation B',
    'Matchday line-up': 'Composition d\'avant-match',
    'Warm-up': 'Échauffement',
    'U-12 squad': 'Équipe U-12',
    'Formation A squad lined up before kick-off':
      'La Formation A alignée avant le coup d\'envoi',
    'Formation A players warming up on the pitch':
      'Les joueurs de la Formation A à l\'échauffement',
    'Formation B U-12 squad photo before a match':
      'Photo de l\'équipe U-12 (Formation B) avant un match',
    'Squad Rating': 'Note de l\'équipe',
    'Overall': 'Global',
    'Formation A ratings': 'Notes de la Formation A',
    'Formation B ratings': 'Notes de la Formation B',
    'Our U-19 side, the club\'s showcase. They press high and move the ball forward fast, with a captain\'s mindset in every position.':
      'Notre équipe U-19, la vitrine du club. Elle joue un pressing haut et des transitions rapides, avec un esprit de capitaine à chaque poste.',
    'Our U-12 side, where it all begins. Every child gets real playing time and builds the right habits to join Formation A one day.':
      'Notre équipe U-12, là où tout commence. Chaque enfant a du vrai temps de jeu et prend les bonnes habitudes pour rejoindre un jour la Formation A.',
    'Attack: 4 out of 5 stars': 'Attaque : 4 étoiles sur 5',
    'Attack: 3.5 out of 5 stars': 'Attaque : 3,5 étoiles sur 5',
    'Defense: 4 out of 5 stars': 'Défense : 4 étoiles sur 5',
    'Defense: 3.5 out of 5 stars': 'Défense : 3,5 étoiles sur 5',
    'Overall: 4 out of 5 stars': 'Global : 4 étoiles sur 5',

    'The 2026 Kits': 'Les maillots 2026',
    'Home · Away · Third · Alternate': 'Domicile · Extérieur · Third · Alternatif',
    'Signature Red': 'Rouge signature',
    'The home shirt: the club red in liquid marble, with black and grey trims and the crest over the heart.':
      'Le maillot porté à domicile : le rouge du club en marbré liquide, avec des finitions noir et gris et le blason sur le cœur.',
    'Marble Black': 'Noir marbré',
    'The away shirt: black marble, with the club red on the sides and cuffs.':
      'Le maillot porté à l\'extérieur : un marbré noir, avec le rouge du club sur les flancs et aux poignets.',
    'Monochrome': 'Monochrome',
    'A black and white shirt. Only the crest adds colour.':
      'Un maillot noir et blanc. Seul le blason apporte de la couleur.',
    'Graffiti Red': 'Rouge graffiti',
    'The club red in a graffiti version: black strokes, with white and grey raglan sleeves.':
      'Le rouge du club en version graffiti : des traits noirs, avec des manches raglan blanc et gris.',
    'Talent de Demain FC home shirt, marbled red with black and grey trims':
      'Maillot domicile du Talent de Demain FC, rouge marbré avec finitions noir et gris',
    'Talent de Demain FC away shirt, marbled black with red panels and cuffs':
      'Maillot extérieur du Talent de Demain FC, noir marbré avec panneaux et poignets rouges',
    'Talent de Demain FC third shirt, black and white marble':
      'Troisième maillot du Talent de Demain FC, marbré noir et blanc',
    'Talent de Demain FC alternate shirt, red with a black graffiti pattern and white raglan sleeves':
      'Maillot alternatif du Talent de Demain FC, rouge à motif graffiti noir et manches raglan blanches',

    'Coaching Staff': 'L\'encadrement',
    'The people behind the players': 'Ceux qui sont derrière les joueurs',
    'Staff': 'Encadrement',
    'The Technical Team': 'Le staff technique',
    'The staff works as one: head coach, assistants, goalkeeper coach and fitness coach. Every session is planned ahead, filmed, then reviewed with the players. Young players train in professional conditions.':
      'Le staff travaille ensemble : entraîneur principal, adjoints, entraîneur des gardiens et préparateur physique. Chaque séance est préparée à l\'avance, filmée, puis analysée avec les joueurs. Les jeunes s\'entraînent ainsi dans des conditions professionnelles.',
    'Head Coach': 'Entraîneur principal',
    'Assistant Coaches': 'Entraîneurs adjoints',
    'GK Coach': 'Entraîneur des gardiens',
    'Athletic Trainer': 'Préparateur physique',
    'Talent de Demain FC coaching staff on the touchline':
      'L\'encadrement du Talent de Demain FC au bord du terrain',

    'Leadership': 'Direction',
    'The President': 'Le président',
    'The president': 'Le président',
    'The president founded the club in 2023 with a simple idea: many young players have talent, but few get a chance. The club gives the next generation a place to show what they can do. The president also learns from Europe\'s top clubs to bring their methods back to Abidjan.':
      'Le président a fondé le club en 2023 avec une idée simple : beaucoup de jeunes ont du talent, mais peu ont leur chance. Le club donne à la nouvelle génération l\'occasion de se montrer. Le président va aussi apprendre auprès des grands clubs européens pour en ramener les méthodes à Abidjan.',
    'Founder': 'Fondateur',
    'Est. 2023': 'Depuis 2023',
    'Madrid Exchange': 'Échange avec Madrid',
    'With JF, club partner': 'Avec JF, partenaire du club',
    'At the ground': 'Au terrain',
    'Visit to Real Madrid': 'Visite au Real Madrid',
    'With Real Madrid representatives': 'Avec des représentants du Real Madrid',
    'Working meeting, Madrid': 'Réunion de travail, Madrid',
    'Official portrait of the president of Talent de Demain FC':
      'Portrait officiel du président du Talent de Demain FC',
    'The president of Talent de Demain FC with his partner JF on the pitch':
      'Le président du Talent de Demain FC avec son partenaire JF sur le terrain',
    'The president of Talent de Demain FC at the training ground':
      'Le président du Talent de Demain FC au terrain d\'entraînement',
    'The president of Talent de Demain FC visiting Real Madrid\'s facilities in Spain':
      'Le président du Talent de Demain FC en visite dans les installations du Real Madrid',
    'The president of Talent de Demain FC with a Real Madrid representative in front of the club\'s UEFA Champions League Final 2024 mural':
      'Le président du Talent de Demain FC avec un représentant du Real Madrid devant la fresque de la finale de Ligue des champions 2024',
    'The president of Talent de Demain FC in a working meeting with Real Madrid representatives in Madrid':
      'Le président du Talent de Demain FC en réunion de travail avec des représentants du Real Madrid',

    /* ---- academy ---- */
    'Academy · Talent de Demain FC': 'Académie · Talent de Demain FC',
    'Match replays and training sessions of the Talent de Demain FC academy.':
      'Les rediffusions de matchs et les séances d\'entraînement de l\'académie du Talent de Demain FC.',
    'On The Pitch': 'Sur le terrain',
    'We film every match, and every session has a goal. Watch our games in full, sorted by club event, then step into our training week.':
      'Nous filmons chaque match, et chaque séance a un objectif. Regardez nos rencontres en entier, classées par événement du club, puis découvrez notre semaine d\'entraînement.',
    'Match Replays': 'Rediffusions des matchs',
    'Full games · VEO': 'Matchs entiers · VEO',
    'Matchday · Game 1': 'Journée · Match 1',
    'Matchday · Game 2': 'Journée · Match 2',
    'Showcase': 'Showcase',
    '30 July 2026 · 77:39 · Full match + tagged highlights on Veo':
      '30 juillet 2026 · 77:39 · Match entier + temps forts sur Veo',
    '29 July 2026 · 194:41 · Full match + tagged highlights on Veo':
      '29 juillet 2026 · 194:41 · Match entier + temps forts sur Veo',
    '30 July 2026 · 84:41 · Full match + tagged highlights on Veo':
      '30 juillet 2026 · 84:41 · Match entier + temps forts sur Veo',
    'Watch the match and highlights on Veo (new tab)':
      'Voir le match et les temps forts sur Veo (nouvel onglet)',
    'Match against Yop FC, seen by the Veo camera':
      'Match contre Yop FC, vu par la caméra Veo',
    'Match against Yop FC (29 July), seen by the Veo camera':
      'Match contre Yop FC (29 juillet), vu par la caméra Veo',
    'Second match against Yop FC (30 July), seen by the Veo camera':
      'Deuxième match contre Yop FC (30 juillet), vu par la caméra Veo',
    'Training Sessions': 'Séances d\'entraînement',
    'Training session film': 'Film d\'entraînement',
    'Inside the week': 'Au cœur de la semaine',
    'Ball mastery, quick footwork through the gates and finishing drills, in all weather. This is a Talent de Demain FC session, seen by the player.':
      'Maîtrise du ballon, appuis rapides entre les portes et exercices de finition, par tous les temps. Voici une séance du Talent de Demain FC, vue par le joueur.',
    'Training session, filmed from the player\'s point of view':
      'Séance d\'entraînement, filmée du point de vue du joueur',
    'Session Gallery': 'Galerie des séances',
    'Drills & matchday prep': 'Exercices et préparation d\'avant-match',
    'Ball work': 'Travail du ballon',
    'Team talk': 'Causerie',
    'Technical work': 'Travail technique',
    'Players in a ball-handling drill during training':
      'Joueurs à l\'exercice de maîtrise du ballon',
    'Coach briefing the squad during a training session':
      'L\'entraîneur en causerie avec le groupe',
    'Player controlling a high ball in training':
      'Joueur contrôlant un ballon haut à l\'entraînement',

    /* ---- events ---- */
    'Events · Talent de Demain FC': 'Événements · Talent de Demain FC',
    'Upcoming and past events of Talent de Demain FC: tournaments, trials and club days.':
      'Les événements à venir et passés du Talent de Demain FC : tournois, détections et journées du club.',
    'Club Life': 'La vie du club',
    'Tournaments, trials, open days and club celebrations. Find the next dates here, and the moments we have already shared.':
      'Tournois, détections, portes ouvertes et fêtes du club. Retrouvez ici les prochaines dates et les moments déjà vécus ensemble.',
    'Upcoming': 'À venir',
    'Mark the dates': 'Notez les dates',
    '22 & 23 September 2026': '22 & 23 septembre 2026',
    'U-12 · U-15 · U-19': 'U-12 · U-15 · U-19',
    'Open to all': 'Ouvert à tous',
    'Register Your Interest': 'Je m\'inscris',
    'Trailer for the upcoming detection day': 'Bande-annonce de la prochaine détection',
    'Toggle sound': 'Activer ou couper le son',
    /* ---- the mini tournament poster ---- */
    'New Event': 'Nouvel événement',
    'Mini Tournament': 'Mini-tournoi',
    'Three clubs, one afternoon of football.': 'Trois clubs, un après-midi de football.',
    'When': 'Quand',
    'Where': 'Où',
    'Who': 'Qui',
    'Saturday 15 August 2026, from 2 pm': 'Samedi 15 août 2026, dès 14 h 00',
    /* Le stade et les trois clubs sont des NOMS : ils ne se traduisent pas,
       et n'ont donc pas de ligne ici. */
    'Poster for the Mini Tournament on 15 August 2026 at Stade de Brofodoumé, from 2 pm, with FC Néhémie, Talent de Demain FC and CIAF':
      'Affiche du Mini-tournoi du 15 août 2026 au stade de Brofodoumé, dès 14 h 00, avec FC Néhémie, Talent de Demain FC et CIAF',

    /* ---- Future Talent Tournament (Accra) ---- */
    'International Tournament': 'Tournoi international',
    'Talent de Demain FC is one of the eight teams invited to Accra. Four days of matches, filmed and analysed for scouts.':
      'Le Talent de Demain FC fait partie des huit équipes invitées à Accra. Quatre jours de matchs, filmés et analysés pour les recruteurs.',
    'From 27 to 30 October 2026': 'Du 27 au 30 octobre 2026',
    'Eight U18 teams, including Talent de Demain FC': 'Huit équipes U18, dont le Talent de Demain FC',
    'Organised by': 'Organisé par',
    'Young African Promises (YAP), powered by AS1': 'Young African Promises (YAP), avec AS1',
    'Poster for the Future Talent Tournament, 27 to 30 October 2026 at Legon Sports Stadium, Accra, with the eight invited teams including Talent de Demain FC':
      'Affiche du Future Talent Tournament, du 27 au 30 octobre 2026 au Legon Sports Stadium d\'Accra, avec les huit équipes invitées dont le Talent de Demain FC',
    /* ---- German Connect trial (past) ---- */
    'Looking back at the German Connect trial': 'Retour sur la détection German Connect',
    'Two days at the Stade de Brofodoumé to spot the club\'s next generation. This is the trailer that launched it.':
      'Deux journées au stade de Brofodoumé pour repérer la nouvelle génération du club. Voici la bande-annonce qui l\'a lancée.',
    'Trailer for the German Connect trial': 'Bande-annonce de la détection German Connect',
    'German Connect Trial': 'Détection German Connect',
    'Poster for the German Connect trial, 22 and 23 September 2026 at Stade de Brofodoumé, from 9 am':
      'Affiche de la détection German Connect, 22 et 23 septembre 2026 au stade de Brofodoumé, dès 9 h 00',

    'Club Tournament': 'Tournoi du club',
    'Formation A · Details announced on our socials':
      'Formation A · Détails annoncés sur nos réseaux',
    'Follow Us': 'Nous suivre',
    'Family & Community Day': 'Journée familles et communauté',
    'Open doors at the club · Free entry': 'Portes ouvertes au club · Entrée libre',
    'Get In Touch': 'Nous contacter',
    'Date': 'Date',
    'Event Film': 'Film d\'événement',
    'Event aftermovie': 'Aftermovie de l\'événement',
    'Inside our latest event': 'Au cœur de notre dernier événement',
    'Filmed from the crowd: the sounds, the colours and the football of a day at Talent de Demain FC. Turn the sound on to live it.':
      'Filmé au milieu du public : les sons, les couleurs et le football d\'une journée au Talent de Demain FC. Activez le son pour la vivre.',
    'Aftermovie of the latest club event': 'Aftermovie du dernier événement du club',
    'Past Events': 'Événements passés',
    'Official posters': 'Affiches officielles',
    'Tournoi de Détection': 'Tournoi de Détection',
    'Friendly match against Aka de Bongo': 'Match amical contre Aka de Bongo',
    'Babi Talents Connection': 'Babi Talents Connection',
    'Poster for the Tournoi de Détection': 'Affiche du Tournoi de Détection',
    'Poster for the friendly match against Académie Aka de Bongo':
      'Affiche du match amical contre l\'Académie Aka de Bongo',
    'Poster for Babi Talents Connection': 'Affiche de Babi Talents Connection',

    /* ---- community ---- */
    'Community · Talent de Demain FC': 'Communauté · Talent de Demain FC',
    'Follow Talent de Demain FC: social networks, useful links and contact details.':
      'Suivez le Talent de Demain FC : réseaux sociaux, liens utiles et coordonnées.',
    'Join Us': 'Rejoignez-nous',
    'The club lives off the pitch too. Follow us on social media and write to us whenever you like.':
      'Le club vit aussi en dehors du terrain. Suivez-nous sur les réseaux et écrivez-nous quand vous le souhaitez.',
    'Our Networks': 'Nos réseaux',
    'Follow the club': 'Suivre le club',
    '@talent_de_demainfc · daily life of the club':
      '@talent_de_demainfc · le quotidien du club',
    '@talentdedemainfc · match replays and academy films':
      '@talentdedemainfc · rediffusions et films de l\'académie',
    'Club news for families & supporters':
      'L\'actualité du club pour les familles et les supporters',
    'Instagram (opens in a new tab)': 'Instagram (nouvel onglet)',
    'YouTube (opens in a new tab)': 'YouTube (nouvel onglet)',
    'Facebook (opens in a new tab)': 'Facebook (nouvel onglet)',

    'Trials · News · Supporters': 'Détections · Actualités · Supporters',
    'Full name': 'Nom complet',
    'Your name': 'Votre nom',
    'Email': 'E-mail',
    'I am a…': 'Je suis…',
    'Choose one': 'Choisissez',
    'Player: I want a trial': 'Joueur : je veux passer une détection',
    'Parent or guardian': 'Parent ou tuteur',
    'Coach or staff': 'Entraîneur ou encadrant',
    'Supporter': 'Supporter',
    'Partner or sponsor': 'Partenaire ou sponsor',
    'Age group': 'Catégorie',
    '(players)': '(joueurs)',
    'Not applicable': 'Sans objet',
    'Message': 'Message',
    '(optional)': '(facultatif)',
    'Tell us about yourself, your position, your club…':
      'Parlez-nous de vous, de votre poste, de votre club…',
    'I agree that Talent de Demain FC may contact me about trials, matches and club news. I can unsubscribe at any time.':
      'J\'accepte que le Talent de Demain FC me contacte au sujet des détections, des matchs et de l\'actualité du club. Je peux me désinscrire à tout moment.',
    'Send My Request': 'Envoyer ma demande',
    'Leave this empty:': 'Laissez ce champ vide :',
    'Be first to know when trial dates are announced.':
      'Soyez les premiers informés des dates de détection.',
    'Match replays and academy films, straight to your inbox.':
      'Les rediffusions et les films de l\'académie, directement dans votre boîte mail.',
    'Invitations to club events and open days.':
      'Des invitations aux événements et aux portes ouvertes du club.',
    'Partners: we\'ll send you the club\'s sponsorship file.':
      'Partenaires : nous vous envoyons le dossier de partenariat du club.',
    'Chat on WhatsApp': 'Discuter sur WhatsApp',
    'The fastest way to reach the club': 'Le moyen le plus rapide de joindre le club',

    'Useful Links': 'Liens utiles',
    'Everything in one place': 'Tout au même endroit',
    'Match replays': 'Rediffusions des matchs',
    'Upcoming events': 'Événements à venir',
    'Our squads': 'Nos équipes',
    'Trials & registration': 'Détections et inscription',
    'The 2026 kits': 'Les maillots 2026',
    'Become a partner': 'Devenir partenaire',
    'Contact': 'Contact',
    'Our contact details': 'Nos coordonnées',
    'Phone / WhatsApp': 'Téléphone / WhatsApp',
    'Training Ground': 'Terrain d\'entraînement',
    'Address to confirm': 'Adresse à confirmer',
    'City, Country': 'Ville, Pays',
    'Trials & Recruitment': 'Détections et recrutement',
    'Open trials each season:': 'Détections ouvertes chaque saison :',
    'see': 'voir',
    'for the next date.': 'pour la prochaine date.'
  };

  /* Same English word, different French depending on where it sits. */
  var SCOPED = {
    '.kit__kicker': { 'Home': 'Domicile', 'Away': 'Extérieur', 'Third': 'Third',
                      'Alternate': 'Alternatif' }
  };

  /* Status strings written by pages.js at runtime, exposed for it to read. */
  var RUNTIME = {
    fr: {
      ok: 'Merci, votre demande a bien été envoyée. Le club vous répondra rapidement.',
      err: 'Désolé, le formulaire n\'a pas pu être envoyé. Écrivez-nous à contact@talentdedemainfc.com ou sur WhatsApp.',
      scroll: 'Défiler', rotation: 'Rotation'
    },
    en: {
      ok: 'Thank you, your request has been sent. The club will get back to you shortly.',
      err: 'Sorry, the form could not be sent. Please write to contact@talentdedemainfc.com or message us on WhatsApp.',
      scroll: 'Scroll', rotation: 'Rotation'
    }
  };

  /* ---- language state --------------------------------------------------- */
  var stored;
  try { stored = localStorage.getItem('tdd-lang'); } catch (e) { stored = null; }
  var lang = (stored === 'en' || stored === 'fr') ? stored : 'fr';   // FR default

  window.TDD_I18N = { lang: lang, t: RUNTIME[lang] };

  /* Invert the table: the page is French, so we look French up to get English.
     Where several English strings share one French wording (case variants such
     as "The 2026 Kits" / "The 2026 kits"), the first one wins — the difference
     is cosmetic. */
  var EN = {}, k1;
  for (k1 in FR) if (!(FR[k1] in EN)) EN[FR[k1]] = k1;

  var SCOPED_EN = {}, sel1, w1;
  for (sel1 in SCOPED) {
    SCOPED_EN[sel1] = {};
    for (w1 in SCOPED[sel1]) SCOPED_EN[sel1][SCOPED[sel1][w1]] = w1;
  }

  /* Normalise for lookup: collapse whitespace, unify the two apostrophes. */
  function key(s) {
    return s.replace(/’/g, "'").replace(/\s+/g, ' ').trim();
  }

  /* Only ever called to go French → English; French needs no work. */
  function translate() {
    document.documentElement.lang = 'en';

    // 1. text nodes
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node, nodes = [];
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(function (n) {
      var k = key(n.nodeValue);
      var el = n.parentElement;
      var out;
      for (var sel in SCOPED_EN) {
        if (el && el.closest(sel) && SCOPED_EN[sel][k] !== undefined) { out = SCOPED_EN[sel][k]; break; }
      }
      if (out === undefined) out = EN[k];
      if (out !== undefined) {
        // keep the surrounding whitespace so inline layout is unchanged
        var lead = n.nodeValue.match(/^\s*/)[0];
        var tail = n.nodeValue.match(/\s*$/)[0];
        n.nodeValue = lead + out + tail;
      }
    });

    // 2. translatable attributes
    ['placeholder', 'aria-label', 'alt', 'title'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var out = EN[key(el.getAttribute(attr))];
        if (out !== undefined) el.setAttribute(attr, out);
      });
    });

    // 3. document title and description
    var t = EN[key(document.title)];
    if (t) document.title = t;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      var d = EN[key(meta.content)];
      if (d) meta.content = d;
    }
  }

  if (lang === 'en') translate();

  /* ---- the switch ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var actions = document.querySelector('.nav__actions');
    if (!actions) return;

    var btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.type = 'button';
    // the button offers the OTHER language
    btn.textContent = lang === 'fr' ? 'EN' : 'FR';
    btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
    btn.addEventListener('click', function () {
      try { localStorage.setItem('tdd-lang', lang === 'fr' ? 'en' : 'fr'); } catch (e) {}
      // reload rather than re-translate: headlines have been split into
      // per-letter spans and the menu panel cloned by the time this runs
      location.reload();
    });
    actions.insertBefore(btn, actions.firstChild);
  });
})();
