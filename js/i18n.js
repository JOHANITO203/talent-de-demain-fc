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
    'Talent de Demain FC — home': 'Talent de Demain FC — accueil',
    'Talent de Demain FC crest': 'Blason du Talent de Demain FC',
    'Join The Club': 'Rejoindre le club',
    'Official sponsor': 'Sponsor officiel',
    'Official sponsor:': 'Sponsor officiel :',
    '© 2026 Talent de Demain FC — EST. 2023': '© 2026 Talent de Demain FC — DEPUIS 2023',

    /* ---- landing ---- */
    'Talent de Demain FC — Forging Football Leaders':
      'Talent de Demain FC — Former les leaders du football',
    'Talent de Demain FC — the academy forging the football leaders of tomorrow.':
      'Talent de Demain FC — l\'académie qui forme les leaders du football de demain.',
    'Forging football': 'Former les',
    'leaders.': 'leaders du football.',
    'Join our legacy.': 'Rejoignez notre histoire.',
    'An academy built for the next generation — elite coaching, real match minutes, and a clear path from first touch to first team.':
      'Une académie pensée pour la nouvelle génération — un encadrement d\'élite, du vrai temps de jeu, et un chemin clair de la première touche à l\'équipe première.',
    'Explore Academy': 'Découvrir l\'académie',
    'Monochrome 2026': 'Monochrome 2026',
    'Liquid marble. Grey crew collar.': 'Marbré liquide. Col rond gris.',
    'Match-Grade Fabric': 'Tissu de compétition',
    'Breathable weave, built for intensity.': 'Maille respirante, conçue pour l\'intensité.',
    'The Number 1': 'Le numéro 1',
    'Worn by the next generation.': 'Porté par la nouvelle génération.',
    'Your Name Next': 'Votre nom ensuite',
    'Trials open for the 2026–27 season.': 'Détections ouvertes pour la saison 2026-27.',
    'Scroll': 'Défiler',
    'Rotation': 'Rotation',
    'Inside the club': 'Dans le club',
    'Talent de Demain FC players and staff during a training session':
      'Joueurs et encadrement du Talent de Demain FC pendant une séance',
    'Talent de Demain FC home jersey rotating':
      'Maillot du Talent de Demain FC en rotation',
    'Talent de Demain FC home jersey': 'Maillot du Talent de Demain FC',
    'The next generation starts here.': 'La nouvelle génération commence ici.',
    'From the first training session to the first professional contract — one club, one path, one shirt.':
      'De la première séance au premier contrat professionnel — un club, un parcours, un maillot.',

    /* ---- squads ---- */
    'Squads — Talent de Demain FC': 'Équipes — Talent de Demain FC',
    'The squads of Talent de Demain FC — Formation A, Formation B, coaching staff and club leadership.':
      'Les équipes du Talent de Demain FC — Formation A, Formation B, encadrement et direction du club.',
    'The Club': 'Le club',
    'Three age groups — U-12, U-15 and U-19 — one identity. Every squad trains, travels and plays under the same idea of football: brave, disciplined, and built on young talent.':
      'Trois catégories — U-12, U-15 et U-19 — une seule identité. Chaque équipe s\'entraîne, se déplace et joue avec la même idée du football : courageuse, disciplinée, bâtie sur les jeunes talents.',
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
    'Our U-19 side and flagship squad. High pressing, quick transitions and a captain\'s mentality across the pitch — the standard-bearers of the club.':
      'Notre équipe U-19 et notre vitrine. Pressing haut, transitions rapides et une mentalité de capitaine sur tout le terrain — les porte-drapeaux du club.',
    'Our U-12 side — where the journey starts. Fearless football, real match minutes, and the habits that build tomorrow\'s Formation A.':
      'Notre équipe U-12 — là où tout commence. Un football sans complexe, du vrai temps de jeu, et les habitudes qui bâtissent la Formation A de demain.',
    'Attack: 4 out of 5 stars': 'Attaque : 4 étoiles sur 5',
    'Attack: 3.5 out of 5 stars': 'Attaque : 3,5 étoiles sur 5',
    'Defense: 4 out of 5 stars': 'Défense : 4 étoiles sur 5',
    'Defense: 3.5 out of 5 stars': 'Défense : 3,5 étoiles sur 5',
    'Overall: 4 out of 5 stars': 'Global : 4 étoiles sur 5',

    'The 2026 Kits': 'Les maillots 2026',
    'Home · Away · Third · Alternate': 'Domicile · Extérieur · Third · Alternatif',
    'Signature Red': 'Rouge signature',
    'The colour we defend at home — club red in a liquid marble print, black and grey trim, crest over the heart.':
      'La couleur que l\'on défend à domicile — le rouge du club en marbré liquide, finitions noir et gris, blason sur le cœur.',
    'Marble Black': 'Noir marbré',
    'Worn on the road — black marble cut through with the club\'s red down the flanks and at the cuffs.':
      'Porté à l\'extérieur — un marbré noir traversé du rouge du club sur les flancs et aux poignets.',
    'Monochrome': 'Monochrome',
    'Black and white, no compromise — the crest carries the only colour on the shirt.':
      'Noir et blanc, sans compromis — le blason porte la seule couleur du maillot.',
    'Graffiti Red': 'Rouge graffiti',
    'A sharper edge on club red — black graffiti strokes under white and grey raglan sleeves.':
      'Une version plus tranchante du rouge du club — traits graffiti noirs sous des manches raglan blanc et gris.',
    'Talent de Demain FC home kit — red marbled shirt with black and grey trim':
      'Maillot domicile du Talent de Demain FC — rouge marbré, finitions noir et gris',
    'Talent de Demain FC away kit — black marbled shirt with red side panels and cuffs':
      'Maillot extérieur du Talent de Demain FC — noir marbré, panneaux et poignets rouges',
    'Talent de Demain FC third kit — black and white marbled shirt':
      'Troisième maillot du Talent de Demain FC — marbré noir et blanc',
    'Talent de Demain FC alternate kit — red shirt with a black graffiti print and white raglan sleeves':
      'Maillot alternatif du Talent de Demain FC — rouge à motif graffiti noir, manches raglan blanches',

    'Coaching Staff': 'L\'encadrement',
    'The people behind the players': 'Ceux qui sont derrière les joueurs',
    'Staff': 'Encadrement',
    'The Technical Team': 'Le staff technique',
    'A staff built like a squad: head coach, assistants, goalkeeping and athletic coaches working as one unit. Every session is planned, filmed and reviewed — because young players deserve professional standards.':
      'Un staff construit comme une équipe : entraîneur principal, adjoints, entraîneur des gardiens et préparateur physique travaillant d\'un seul bloc. Chaque séance est planifiée, filmée et débriefée — parce que les jeunes joueurs méritent des standards professionnels.',
    'Head Coach': 'Entraîneur principal',
    'Assistant Coaches': 'Entraîneurs adjoints',
    'GK Coach': 'Entraîneur des gardiens',
    'Athletic Trainer': 'Préparateur physique',
    'Talent de Demain FC coaching staff on the touchline':
      'L\'encadrement du Talent de Demain FC au bord du terrain',

    'Leadership': 'Direction',
    'The President': 'Le président',
    'The president': 'Le président',
    'The club was founded on one belief: talent is everywhere, opportunity is not. Since 2023, the president has carried that mission — building a club where the next generation gets its chance, and going to learn from the best in Europe to bring those standards home.':
      'Le club est né d\'une conviction : le talent est partout, l\'opportunité ne l\'est pas. Depuis 2023, le président porte cette mission — bâtir un club où la nouvelle génération a sa chance, et aller apprendre auprès des meilleurs en Europe pour ramener ces standards à la maison.',
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
    'Academy — Talent de Demain FC': 'Académie — Talent de Demain FC',
    'Match replays and training sessions of the Talent de Demain FC academy.':
      'Les rediffusions de matchs et les séances d\'entraînement de l\'académie du Talent de Demain FC.',
    'On The Pitch': 'Sur le terrain',
    'Every match filmed, every session with a purpose. Watch the full replays of our games — organized by club event — and step inside our training week.':
      'Chaque match filmé, chaque séance avec un objectif. Regardez l\'intégralité de nos rencontres — classées par événement du club — et entrez dans notre semaine d\'entraînement.',
    'Match Replays': 'Rediffusions des matchs',
    'Full games — VEO': 'Matchs entiers — VEO',
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
    'Match vs Yop FC — pitch view from the Veo camera':
      'Match contre Yop FC — vue du terrain par la caméra Veo',
    'Match vs Yop FC (29 July) — pitch view from the Veo camera':
      'Match contre Yop FC (29 juillet) — vue du terrain par la caméra Veo',
    'Second match vs Yop FC (30 July) — pitch view from the Veo camera':
      'Deuxième match contre Yop FC (30 juillet) — vue du terrain par la caméra Veo',
    'Training Sessions': 'Séances d\'entraînement',
    'Training session film': 'Film d\'entraînement',
    'Inside the week': 'Au cœur de la semaine',
    'Ball mastery, quick feet through the gates, finishing drills — whatever the weather. This is what a Talent de Demain FC session looks like from the player\'s point of view.':
      'Maîtrise du ballon, appuis rapides dans les portes, exercices de finition — par tous les temps. Voici à quoi ressemble une séance du Talent de Demain FC, vue par le joueur.',
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
    'Events — Talent de Demain FC': 'Événements — Talent de Demain FC',
    'Upcoming and past events of Talent de Demain FC — tournaments, trials, and club days.':
      'Les événements à venir et passés du Talent de Demain FC — tournois, détections et journées du club.',
    'Club Life': 'La vie du club',
    'Tournaments, trials, open days and club celebrations — what\'s coming next, and the moments we\'ve already lived together.':
      'Tournois, détections, portes ouvertes et fêtes du club — ce qui arrive, et les moments déjà vécus ensemble.',
    'Upcoming': 'À venir',
    'Mark the dates': 'Notez les dates',
    'Next Event — Détection': 'Prochain événement — Détection',
    'Date to confirm': 'Date à confirmer',
    'U-12 · U-15 · U-19': 'U-12 · U-15 · U-19',
    'Open to all': 'Ouvert à tous',
    'One day to be seen. Bring your boots, bring your game — the next generation of Talent de Demain FC starts with a trial.':
      'Une journée pour se faire voir. Prenez vos crampons, montrez votre jeu — la nouvelle génération du Talent de Demain FC commence par une détection.',
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
    'Poster for the Mini Tournament on 15 August 2026, Stade de Brofodoumé, from 2 pm — FC Néhémie, Talent de Demain FC and CIAF':
      'Affiche du Mini-tournoi du 15 août 2026, stade de Brofodoumé, dès 14h00 — FC Néhémie, Talent de Demain FC et CIAF',

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
    'Shot from the heart of the crowd — the sounds, the colors and the football of a Talent de Demain FC day. Turn the sound on and step in.':
      'Filmé au cœur du public — les sons, les couleurs et le football d\'une journée Talent de Demain FC. Montez le son et entrez.',
    'Aftermovie of the latest club event': 'Aftermovie du dernier événement du club',
    'Past Events': 'Événements passés',
    'Official posters': 'Affiches officielles',
    'Tournoi de Détection': 'Tournoi de Détection',
    'Friendly Match — Aka de Bongo': 'Match amical — Aka de Bongo',
    'Babi Talents Connection': 'Babi Talents Connection',
    'Poster for the Tournoi de Détection': 'Affiche du Tournoi de Détection',
    'Poster for the friendly match against Académie Aka de Bongo':
      'Affiche du match amical contre l\'Académie Aka de Bongo',
    'Poster for Babi Talents Connection': 'Affiche de Babi Talents Connection',

    /* ---- community ---- */
    'Community — Talent de Demain FC': 'Communauté — Talent de Demain FC',
    'Follow Talent de Demain FC — social networks, useful links and contact details.':
      'Suivez le Talent de Demain FC — réseaux sociaux, liens utiles et coordonnées.',
    'Join Us': 'Rejoignez-nous',
    'The club lives beyond the pitch. Follow the journey, share the moments, and reach out — the door is open.':
      'Le club vit au-delà du terrain. Suivez le parcours, partagez les moments, et écrivez-nous — la porte est ouverte.',
    'Our Networks': 'Nos réseaux',
    'Follow the club': 'Suivre le club',
    '@talent_de_demainfc — daily life of the club':
      '@talent_de_demainfc — le quotidien du club',
    '@talentdedemainfc — match replays & academy films':
      '@talentdedemainfc — rediffusions et films de l\'académie',
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
    'Player — I want a trial': 'Joueur — je veux passer une détection',
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
    'The door is open': 'La porte est ouverte',
    'Phone / WhatsApp': 'Téléphone / WhatsApp',
    'Training Ground': 'Terrain d\'entraînement',
    'Address to confirm': 'Adresse à confirmer',
    'City, Country': 'Ville, Pays',
    'Trials & Recruitment': 'Détections et recrutement',
    'Open trials each season —': 'Détections ouvertes chaque saison —',
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
      ok: 'Merci — votre demande a bien été envoyée. Le club vous répondra rapidement.',
      err: 'Désolé, le formulaire n\'a pas pu être envoyé. Écrivez-nous à contact@talentdedemainfc.com ou sur WhatsApp.',
      scroll: 'Défiler', rotation: 'Rotation'
    },
    en: {
      ok: 'Thank you — your request has been sent. The club will get back to you shortly.',
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
