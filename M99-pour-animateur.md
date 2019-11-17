
Ce document vient en accompagnement de la feuille M99-mémoire, qui
est à distribuer à tous les participants.

Présentation du M99
===================

Le M99 est une machine dotée de 100 cases mémoire (la grille en haut
de la feuille), et d'un processeur (en bas de la feuille).

La mémoire est composée de 100 mots mémoire de 3 chiffres (valeur de
000 à 999). Ces 100 mots mémoire sont adressables par des adresses
codées sur 2 chiffres. Cette mémoire va contenir données et instructions.

Le processeur dispose de deux registres généraux nommés A et B, et
d'un registre accumulateur/résultat nommé R. Ces registres sont de 3
chiffres, mais au contraire de la mémoire, ils ont un signe. Ils
peuvent donc contenir des valeurs comprises entre -999 et 999.

Le processeur dispose aussi d'un quatrième registre nommé PC (Program
Counter). C'est le pointeur d'instruction, contenant l'adresse mémoire
de la prochaine instruction à exécuter. Lorsqu'on utilise le M99, on
peut noter le numéro de l'instruction à exécuter dans la case prévue
à cette effet, mais en pratique, il est plus simple de le matérialiser
avec un "pion" situé sur une des cases de la grille mémoire, ou même
de suivre avec son doigt.

Unité arithmétique et logique
----------------------------

L'unité arithmétique et logique – UAL – est en charge d'effectuer les
calculs. Les opérandes et résultats sont dans les registres, A et
B pour les opérandes, R pour le résultat.

Unité de commande
-----------------

L'unité de commande pilote l'ordinateur. Son cycle de fonctionnement comporte 3 étapes :

1. charger l'instruction depuis la case mémoire pointée par PC vers la
   zone dédiée dans l'UAL (la case sous le registre PC).
   Incrémenter ensuite le PC.
2. décoder l'instruction : à partir des 3 chiffres codant
   l'instruction, identifier quelle est l’opération à réaliser en
   utilisant le pense-bête à droite de l'UAL.
3. exécuter l'instruction.


Jeu d'instruction
-----------------

code  | mnémonique | instruction à réaliser
----- | ---------- | ----------------------
0 x y | `STR xy`   | copie le contenu du registre R dans le mot mémoire d'adresse _xy_
1 x y | `LDA xy`   | copie le mot mémoire d’adresse _xy_ dans le registre A
2 x y | `LDB xy`   | copie le mot mémoire d’adresse _xy_ dans le registre B
3 x y | `MOV x y`  | copie registre Rx dans Ry (R0: R; R1: A; R2: B)
4 - - | **opérations arithmétique et logiques**
4 0 0 | `ADD`      | ajoute les valeurs des registres A et B, produit le résultat dans R 
4 0 1 | `SUB`      | soustrait la valeur du registre B à celle du registre A, produit le résultat dans R 
. . . | etc        | …
5 x y | `JMP x y`  | branche en _xy_ (PC reçoit la valeur _xy_)
6 x y | `JPP x y`  | branche en _xy_ si la valeur du registre R est positive
7 x y | `JEQ x y`  | saute une case (PC += 2) si la valeur du registre R est égale à _xy_
8 x y | `JNE x y`  | saute une case (PC += 2) si la valeur du registre R est différent de _xy_

### Boot et arrêt

La machine démarre avec la valeur nulle comme pointeur d'instruction
(PC=0) et elle s'arrête si le pointeur d'instruction vaut 99.

On peut donc utiliser le mnémonique `HLT` comme synonyme de `JMP 99`.

### Entrées/sorties

Les entrées/sortries sont "mappées" en mémoire: Écrire le mot mémoire
99 écrit sur le terminal, tandis que les valeurs saisies sur le
terminal seront lues dans le mot mémoire 99.

Exercice 1
==========

Objectifs: 
 - prise en main du M99
 - comprendre l'encodage des opcode dans la mémoire
 - comprendre le cycle fetch/decode/execute

Q1: Que fait le programme chargé à l'adresse 0 ?
------------------------------------------------

Pour répondre, il faut appliquer le cycle fetch/decode/exec aux
données qui sont dans les premières adresses de la mémoire. Traduire
les valeurs numériques en mémoire est nécessaire.

```
00: LDA 10  // Charge le contenu de la case 10 dans le registre A
01: LDB 11  // Charge le contenu de la case 10 dans le registre A
02: SUB     // R := A - B
03: JPP 7   // Si R > 0 alors PC := 7
04: MOV A R // R := A
05: STR 99  // Copie R en 99, c'est-à-dire, affiche R à l'écran
06: JMP 99  // Arrête le programme
07: MOV B R // R := A
08: STR 99  // Copie R en 99, donc affiche R à l'écran
09: JMP 99  // Arrête le programme
10: 42      // Utilisé seulement comme une donnée, sans signification 
11: 123     // Utilisé seulement comme une donnée, sans signification 
```

Donc au final, ce programme affiche 123, car 42 < 123.

Q2: Que fait le programme débutant à l'adresse 13?
--------------------------------------------------

```
13: LDA 99  // Charge une entrée utilisateur dans A
14: MOV A R // R := A
15: STR 10  // Copie l'entrée utilisateur en 10
16: LDA 99  // Charge une entrée utilisateur dans A
17: MOV A R // R := A
18: STR 11  // Copie l'entrée utilisateur en 11
19: JMP 0   // Branche l'exécution sur 0
```

Donc au final, ce programme demande deux entrées à l'utilisateur avant
d'exécuter le programme précédent (qui affichera le plus grand d'entre
eux).

Q3: Écrire un programme affichant le minimum de deux entrées clavier
--------------------------------------------------------------------

On peut l'écrire à partir de l'adresse 20 en mémoire, et on n'a pas
besoin d'écrire ce qu'on lit en mémoire puisqu'on l'utilise
immédiatement.

```
20: 199; LDA 99  // input A
21: 299; LDB 99  // input B
22: 401; SUB
23: 610; JPP 10  // JMP 10 si R>0, ie si A>B
24: 320; MOV B R // Copie B dans R
25: 099; STR 99  // Affiche B
26: 599; JMP 99  // Halt
27: 320; MOV A R // Copie A dans R
28: 099: STR 99  // Affichage A
29: 599: JMP 99  // Halt
```

Exercice 2
==========

Objectifs:
 - Modifier un programme en assembleur
 - Voir l'intérêt d'un compilateur, et d'un langage de haut niveau

Q1: Que fait le programme débutant à l'adresse 40 (pour les entrées 5 et 2)?
----------------------------------------------------------------------------

Il calcule le produit des deux entrées et affiche le résultat

Q2: Peut-on raccourcir ce programme ?
-------------------------------------

On peut passer à 21 cases en stockant x et y dans les cases 40 et 41
car on n'a plus besoin de ce code une fois qu'on l'a exécuté.
    
Il faut ensuite déplacer les cases 61 et 62 (qui sont respectivement
la valeur 1 et le résultat) dans les cases 59 et 60. Cette opération
est plus simple en *nommant les variables*, c'est à dire en écrivant
par exemple "LDB un" à la place de "LDB 61" dans la case 51.
    
On peut même tomber à 19 cases en utilisant une ruse: au lieu
d'énumérer les trois opérations nécessaires pour afficher le contenu
de A avant de s'arrêter, on branche vers l'endroit du programme 1 qui
fait cela (JMP 04).

Notez que réutiliser les bouts d'un autre programme en sautant au
milieu de son code est considéré comme "très sale" par la plupart des
programmeurs. En pratique on ne veut absolument jamais faire quelque
chose d'aussi dangereux avec de vrais programmes car cela les rend
difficile à lire et à comprendre. On ne fait pas des programmes que
pour la machine, mais aussi (surtout) pour que d'autres humains les
comprennent.

```
  56: 310: MOV A R     ->   56: 504: JMP 04
  57: 099: STR 99
  58: 599: HLT
```

Q3: Corrigez ce programme quand la seconde entrée vaut 0
--------------------------------------------------------

En effet, notre programme calcule par exemple 5*0 = 5 car il ajoute x
au résultat dans tous les cas. Pour corriger, il faut d'abord vérifier
s'il y a besoin d'ajouter x et ensuite seulement le faire.

La première solution est d'ajouter un JMP juste avant la boucle pour
entrer au bon endroit de la boucle (sur le décrément de y). Mais cela
fait un code spagetti assez désagréable.

La seconde solution est de réécrire le corps de boucle pour faire le
décrément du compteur avant l'addition au résultat, au prix de légères
contortions pour sortir de la boucle au bon moment

```
  46: 162: LDA res    ->  46: 162: LDA y
  47: 259: LDB x          47: 261: LDB un
  48: 400: ADD            48: 401: SUB
  49: 062: STR res        49: 899: JNE 99 // on suppose que -1 overflow en 99
  50: 160: LDA y          50: 556: JMP fin // Sort de la boucle
  51: 261: LDB un         51: 162: LDA res
  52: 401: SUB            52: 259: LDB x
  53: 060: STR y          53: 400: ADD
  54: 646: JPP 46         54: 062: STR res
                          55: 546: JMP 46 // Retour début boucle
                          56: 162: LDA res
			  57: 504: JMP 04 // Utilise la fin du prog 1
```

L'instruction de la ligne 49 est assez discutable. Son objectif est de
tester si R==-1, mais on n'a pas de nombres négatifs dans la mémoire.
On suppose donc ici qu'un nombre négatif en registre sera traduit en
son complément à 100 à l'usage. C'est assez réaliste de ce que font
les vrais ordinateurs.
			  
Au final, les deux solutions sont assez diffiles à relire: soit on
commence la première boucle en sautant au milieu, soit on sort de la
dernière boucle en sautant depuis le milieu. C'est quand même plus
simple d'utiliser un langage de haut niveau et un compilateur :)

Lien à l'informatique
=====================

Le M99 est un ordinateur en papier, assez simple à utiliser avec
seulement un crayon, mais il a été pensé pour être relativement
réaliste des vrais ordinateurs.

- La mémoire d'un vrai ordinateur est également découpée en mots
  mémoires, chacun étant doté d'une adresse unique. En général, les
  vrais ordinateurs utilisent des mots de 1 octet (8 bits). Les
  ordinateurs 32bits peuvent avoir jusqu'à 2³² mots (soit un peu plus
  de 4Go de mémoire) tandis que les ordinateurs 64bits peuvent en
  avoir jusqu'à 2⁶⁴ en théorie (18 Exaoctets, 18.10¹⁸ octets).

- Les vrais processeurs ont également des registres afin de gérer au
  mieux le problème de la barrière mémoire. Ils ont également des
  caches pour optimiser les échanges entre la mémoire et le CPU. Là où
  lire en mémoire peut demander une centaine de cycles CPU, lire en
  cache prend entre 10 et 30 cycles. Le M99 n'a pas de caches pour
  simplifier.

- Les vrais programmes sont également écrits sous forme d'opcodes en
  mémoire des vrais ordinateurs, avec le préfixe indiquant l'opération
  tandis que le sufixe indique les opérandes.  Le jeu d'opérations
  élémentaires disponibles varie beaucoup d'un processeur à l'autre. 
  
  Pour le M99, nous avons choisi d'utiliser des mots mémoires de trois
  positions décimales, ce qui contraint fortement le nombre
  d'instructions disponibles. Ces contraintes sont parfaitement
  réalistes de celles que doivent résoudre les fabriquants de CPU.
  Ajouter des instructions simplifie l'écriture de programmes
  efficaces, mais complique grandement le processeur, qui devient plus
  cher et plus énergivore.

  Les processeurs de la famille RISC (reduced instruction set CPU)
  visent la simplicité et n'offrent que peu d'instructions tandis que
  ceux de la famille CISC (complex instruction set CPU) offrent des
  opérations optimisées plus rares, comme des opérations vectorielles.
  
  Il serait faux de dire que l'une des familles est vraiment
  préférable à l'autre. Il s'agit plutôt de deux compromis différents
  entre complexité du processeur et complexité des programmes.  Les
  processeurs des téléphones portables sont souvent des RISC (par
  exemple du constructeur ARM) tandis que ceux des ordinateurs sont
  souvent des CISC (par exemple des constructeurs Intel ou AMD).

- Gérer les entrées/sorties au travers d'adresses particulières de
  l'espace d'adressage du bus mémoire est parfaitement réaliste. En
  revanche, il est rare d'avoir plusieurs périphériques à la même
  adresse et on aurait pu séparer les lectures du clavier et les
  écritures à l'écran dans des zones mémoire différentes. De plus, 
  nous avons ignoré toute la synchronisation qu'un vrai processeur
  doit faire pour échanger avec les périphériques, souvent bien plus
  lent.

Extensions M999
===============

Deux extensions possibles pour la M99 afin d'en faire un M999 (tout en
restant compatible avec le M99). Le M99 est un ordinateur en papier,
et le M999 un ordinateur en carton. Le M9 serait-il l'ordinateur-plume?

Registres génériques
--------------------

On ajoute trois registres génériques (R3, R4 et R5) et on augmente la
sémantique du MOV comme suit:

MOV x y
 - x=0: la valeur à écrire vient de R (comme avant)
 - x=1: la valeur à écrire vient de A (comme avant)
 - x=2: la valeur à écrire vient de B (comme avant)
 - x=3: la valeur à écrire vient de R3
 - x=4: la valeur à écrire vient de R4
 - x=5: la valeur à écrire vient de R5
 - x=6: la valeur à écrire est 0 (le nombre zéro)
 - x=7: la valeur à écrire est 1 (le nombre un)
 
 - y=0: SET R:  la valeur est écrite dans R (comme avant)
 - y=1: SET A:  la valeur est écrite dans A (comme avant)
 - y=2: SET B:  la valeur est écrite dans B (comme avant)
 - y=3: SET R3: la valeur est écrite dans R3
 - y=4: SET R4: la valeur est écrite dans R4
 - y=5: SET R5: la valeur est écrite dans R5
 - y=6: SWAP R3: le registre source x est échangé avec R3
 - y=7: SWAP R4: le registre source x est échangé avec R4
 - y=8: SWAP R5: le registre source x est échangé avec R5
 
Cette extension permet de parler de la barrière mémoire. Par exemple,
on peut refaire une multiplication qui tienne uniquement en registre,
et compter le temps que ça prend en considérant que les accès mémoire
(instructions LDA, LDB et STR) sont 100 fois plus longues que les
instructions n'utilisant que les registres (toutes les autres).

On peut introduire cette extension en parlant du problème du register
spilling (où on n'a pas assez de registre pour couvrir les besoin).

Pile et fonctions
-----------------

Pour pouvoir faire des appels de fonction propre, on ajoute un
registre SB (stack base -- initialisé à 98) et les opcodes suivants:

 - 48x: PSH x : Rx est écrit dans la case pointée par SB, puis SB--
 - 49x: POP x : SB++ puis le contenu de @SB est copié dans Rx
 - 9xy: CAL xy: PSH PC (@SB:=PC; SB++) puis PC := xy
 - 409: RET   : POP PC (PC:=@SB; SB--)

La factorielle pourrait être un exemple pas trop fastidieux à mettre
en oeuvre pour réutiliser la multiplication vue plus haut.

On peut même faire un saut calculé en détournant ces instructions:
pour sauter à l'adresse stockée dans R2, je fais "PSH R2; RET"

Pour aller plus loin
====================

Ceux qui aiment bien ces petits jeux autour de l'assembleur devraient
regarder du coté des jeux suivants:

 - [Core War](http://www-cs-students.stanford.edu/~blynn/play/redcode.html)
   où des programmes s'exécutent tous ensemble dans la mémoire d'un
   ordinateur. Chacun tente de stoper les autres en écrivant dans
   leur mémoire.
   
 - [Human Resource Machine](https://en.wikipedia.org/wiki/Human_Resource_Machine).
   Un ensemble de défis à résoudre à l'aide de programmes en
   pseudo-assembleur le plus court possible.
