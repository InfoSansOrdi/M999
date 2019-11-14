# M999, le processeur débranché

L'objectif de cette activité est de montrer le fonctionnement d'un
processeur. Le matériel est constitué d'une feuille A3 à plastifier
pour représenter les cases de la mémoire, plus un décodeur d'opcode à
découper, avec des tirettes.

Plusieurs variantes de M999 sont proposées.

* _M999 "registres"_ dans laquelle les opérandes des instructions sont
exclusivement des registres
* _M999a_ qui utilise un accumulateur


------------------------------------------------------------

M999 "registres"
================

La mémoire est composée de 100 cases, auxquelles s'ajoutent 6
registres génériques (nommés de r0 à r5) et un registre pointeur d'instruction
PC dénotant la case mémoire de la prochaine instruction à exécuter.
Les deux premiers registres ne sont pas modifiables : la valeur de r0
est fixée à 0, et celle de r1 est fixée à 1. Au final, seuls les
registres r2 à r5 sont disponibles pour le programmeur.

Les deux cases mémoires 98 et 99 sont particulières car elles servent
aux I/O. Les lectures dans la case 98 correspondent à des entrées
clavier tandis que les écritures dans la case 99 correspondent à des
écritures à l'écran. On ne peut pas écrire dans la case 98 ni lire dans
la case 99.

Les autres cases mémoire peuvent contenir un nombre décimal de 000 à
999, qui représente soit une donnée arbitraire, soit un opcode
exécutable. Pour les opcodes, le chiffre des centaines représente
l'instruction à exécuter, le chiffre des dizaines représente
l'opérande A tandis que le chiffre des unités est l'opérande B. 

Voici la signification des différentes valeurs possibles pour les
opérandes :

Instr | Mnémonique | Signification
----- | ---------- | -------------
  0   | r0         | Valeur du registre 0 (fixée à 0 par définition)
  1   | r1         | Valeur du registre 1 (fixée à 1 par définition)
  2   | r2         | Valeur du registre 2 (qui change)
  3   | r3         |
  4   | r4         |
  5   | r5         |
  6   | @r2        | Case de la mémoire centrale pointée par r2
  7   | @r3        |
  8   | @r4        |
  9   | @r5        |

Le M999 dispose des 10 instructions suivantes:

Instr | Mnémonique | Signification
----- | ---------- | -------------
  0   | HALT       | La machine s'arrête
  1   | MOVE A B   | Copie la valeur de B dans A
  2   | ADD A B    | Ajoute la valeur de B dans A
  3   | SUB A B    | Soustrait la valeur de B à A
  4   | JPNZ A B   | Jump en B si A est différent de 0
  5   | JPP A B    | Jump en B si A est positif
  6   | LOAD2 A    | Écrit la valeur A (comprise entre 0 et 99) dans r2
  7   | LOAD3 A    | Écrit la valeur A dans r3
  8   | LOAD4 A    | Écrit la valeur A dans r4
  9   | LOAD5 A    | Écrit la valeur A dans r5
  
_MOVE A B_ peut représenter un STORE copiant le contenu d'un registre
vers la mémoire si on utilise _MOVE @ri rj_.  Par exemple l'opcode 163
écrit la valeur de r3 dans la case mémoire pointée par r2. Cette même
instruction peut représenter un LOAD effectuant le mouvement mémoire
inverse, de la mémoire vers les registres. Par exemple, 136 (MOVE r3
@r2) copie le contenu du registre 3 vers la case mémoire pointée par r2.

Extension "fonctions"
---------------------

Cette extension n'est pas vraiment destinée à être utilisée pour
l'instant. C'est une idée pour le futur.

On pourrait imaginer une extension permettant de faire des appels de
fonctions. Dans ce cas, le registre 5 n'est plus générique. Il stocke
le sommet de pile (valeur initiale: 99). On aurait alors besoin des
quatre instructions supplémentaires suivantes permettant
d'empiler/dépiler des paramètres sur la pile, et de faire des appels
de sous-fonctions. Soit la partie instruction de l'opcode n'est plus
décimale mais hexadecimale, soit on économise certaines instructions
LOAD du jeu de base.

  - PUSH A { MOVE A @r5 ; SUB r5 r1 }
  - POP  A { ADD r5 r1 ; MOVE @r5 A }
  - CALL A { MOVE PC @r5 ; SUB r5 r1 ; MOVE A PC } 
  - RET    { ADD r5 r1 ; MOVE @r5 PC }

------------------------------------------------------------

M999a
=====

Mémoire et registres
--------------------

La mémoire est composée de 100 mots mémoire de 3 chiffres (valeur de
000 à 999). Ces 100 mots mémoire sont adressables par des adresses
codées sur 2 chiffres.

Cette mémoire va contenir données et instructions.

Le processeur dispose de deux registres généraux A et B, et d'un
registre accumulateur/résultat R.

Comme la mémoire, ces registres sont de 3 chiffres, et contiennent donc
des valeurs entre 0 et 999.

Le processeur dispose aussi d'un registre pointeur d'instruction PC
contenant l'adresse mémoire de la prochaine instruction à exécuter.

La mémoire et les registres peuvent être matérialisés par une grille
de 10*10 et des cases supplémentaires pour les registres A, B, R.

Le registre PC peut être matérialisé par un "pion" situé sur une des
cases de la grille mémoire.

Unité arithmétique et logique
----------------------------

L'unité arithmétique et logique – UAL – est en charge d'effectuer les
calculs. Les opérandes et résultats sont dans les registres, A et
B pour les opérandes, R pour le résultat.

Unité de commande
-----------------

L'unité de commande pilote l'ordinateur.

Son cycle de fonctionnement comporte 3 étapes :

1. charger l'instruction depuis la mémoire pointée par PC.
   Incrémenter PC.
2. décoder l'instruction : à partir des 3 chiffres codant
   l'instruction, identifier quelle est l’opération à réaliser,
   quelles sont les opérandes.
3. exécuter l'instruction.


Jeu d'instruction
-----------------

op0 | op1 op2 | mnémonique | instruction à réaliser
--- | ------- | ---------- | ----------------------
0 | _addr_ | `LDA`| copie le mot mémoire d’adresse _addr_ dans le registre A
1 | _addr_ | `LDB`| copie le mot mémoire d’adresse _addr_ dans le registre B
2 | _addr_ | `STR`| copie le contenu du registre R dans le mot mémoire d'adresse _addr_
3 | - - | – | **opérations arithmétique et logiques**
3 | 0 0 | `ADD`| ajoute les valeurs des registres A et B, produit le résultat dans R 
3 | 0 1 | `SUB`| soustrait la valeur du registre B à celle du registre A, produit le résultat dans R 
3 | . . | etc | …
4 | _rs_ _rd_ | `MOV` | copie la valeur du registre source _rs_ dans le registre destination _rd_.
5 | _addr_ | `JMP` | branche en _addr_ (PC reçoit la valeur _addr_) 
6 | _addr_ | `JNZ` | branche en _addr_ si la valeur du registre R est non-nulle

Les registres sont désignés par les valeurs suivantes :

valeur | registre
------ | --------
0 | A
1 | B
2 | R

### Boot et arrêt

La machine démarre avec la valeur nulle comme pointeur d'instruction.

La machine stoppe si le pointeur d'instruction vaut 99.

On peut donc utiliser le mnémonique `HLT` comme synonyme de `JMP 99`.

### Entrées/sorties

Les entrées/sortries sont "mappées" en mémoire.

Écrire le mot mémoire 99 écrit sur le terminal.

Les valeurs saisies sur le terminal seront lues dans le mot mémoire 99.

------------------------------------------------------------

# Des outils associés

 * [util-m99](https://github.com/b3/util-m99), un simulateur de M99 écrit en bash.

# Des projets comparables, et autres liens

 * [CARDboard Illustrative Aid to Computation](https://www.cs.drexel.edu/~bls96/museum/cardiac.html), un processeur en carton des
   années 80.
   - [Un simulateur en Python de la chose](http://www.pythondiary.com/blog/Oct.15,2014/building-cpu-simulator-python.html).
   - [Une implémentation FPGA](http://www.drdobbs.com/embedded-systems/paper-to-fpga/240155922?pgno=1).
 * [Little Man Computer](https://en.wikipedia.org/wiki/Little_man_computer), un autre processeur en carton d'un autre âge.
