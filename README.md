# M999, le processeur débranché

L'objectif de cette activité est de montrer le fonctionnement d'un
processeur. Le matériel est constitué d'une feuille A3 à plastifier
pour représenter les cases de la mémoire, plus un décodeur d'opcode à
découper, avec des tirettes.

Plusieurs variantes de M999 sont proposées.

* _M999 "registres"_ dans laquelle les opérandes des instrcutions sont
excusivent des
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

Les deux cases mémoires 0 et 1 sont particulières car elles servent
aux I/O. Les lectures dans la case 0 correspondent à des entrées
clavier tandis que les écritures dans la case 1 correspondent à des
écritures à l'écran. On ne peut pas écrire dans la case 0 ni lire dans
la case 1.

Les autres cases mémoire peuvent contenir un nombre décimal de 000 à
999, qui représente soit une donnée arbitraire, soit un opcode
exécutable. Pour les opcodes, le chiffre des centaines représente
l'instruction à exécuter, le chiffre des dizaines représente
l'opérande A tandis que le chiffre des unités est l'opérande B. 

Voici la signification des différentes valeurs possibles pour les
opérandes :

  - 0: r0 (valeur du registre 0, qui est fixée à 0 par définition)
  - 1: r1 (valeur du registre 1, qui est fixée à 1 par définition)
  - 2: r2 (valeur du registre 2, qui change)
  - 3: r3
  - 4: r4
  - 5: r5
  - 6: @r2 (mémoire centrale, dans la case pointée par r2)
  - 7: @r3
  - 8: @r4
  - 9: @r5

Dans la version simplifiée, le M999 dispose des 6 instructions
suivantes:

  - 0: HALT: la machine s'arrête
  - 1: MOVE A B: Copie la valeur de B dans A
    - Si AB est de forme @ri rj, c'est un STORE: registre vers mémoire
      Exemple: 163 écrit la valeur de r3 dans la case pointée par r2
    - Si AB est de forme ri @rj, c'est un LOAD: mémoire vers registre
      Exemple: 136 charge dans r3 la case mémoire dont l'adresse est dans r2.
    - Les autres formes n'ont pas de nom particulier en asm (je crois).
  - 2: ADD A B: Ajoute la valeur de B dans A
  - 3: SUB A B: Soustrait la valeur de B à A
  - 4: JPNZ A B: Jump en B si A est différent de 0
  - 5: JPP A B: Jump en B si A est positif
  
Une version étendue permet de faire des appels de fonctions. Dans ce
cas, le registre 5 n'est plus générique. Il stoque le sommet de pile
(valeur initiale: 99). On dispose alors des quatre instructions
supplémentaires suivantes permettant d'empiler/dépiler des paramètres
sur la pile, et de faire des appels de sous-fonctions.

  - 6: PUSH A { MOVE A @r5 ; SUB r5 r1 }
  - 7: POP  A { ADD r5 r1 ; MOVE @r5 A }
  - 8: CALL A { MOVE PC @r5 ; SUB r5 r1 ; MOVE A PC } 
  - 9: RET    { ADD r5 r1 ; MOVE @r5 PC }

------------------------------------------------------------

M999a
=====

Mémoire et registres
--------------------

La mémoire est composée de 100 mots mémoire de 3 chiffres (valeur de
000 à 999). Ces 100 mots mémoire sont adressables par des adresses
codées sur 2 chiffres.

Cette mémoire va contenir données et instructions.

Le processeur dispose de deux registres géénraux A et B, et d'un
registre accumulateur/résultat R.

Comme la mémoire, ces registres sont de 3 chiffres, et contiennent donc
des valeurs entre 0 et 999.

Le processeur dispose aussi d'un registre pointeur d'instruction PC
contenant l'adresse mémoire de la prochaine instruction à exécuter.

La mémoire et les registres peuvent être matérialisés par une grille
de 10*10 et des cases supplémentaires pour les regsites A, B, R.

Le registre PC peut être matérialisé par un "pion" situé sur une des
cases de la grille mémoire.

Unité aritmétique et logique
----------------------------

L'unité aritmétique et logique – AUL – est en charge d'effectuer les
calculs. Les opérandes et résultats sont dans les registres, A et
B pour les opérandes, R pour le résultat.

Unité de commande
-----------------

L'unité de commande pilote l'ordinateur.

Son cycle de fonctionement comporte 3 étapes :

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

### Arrêt

La machine stoppe si le pointeur d'instruction vaut 99.

On peut donc utiliser le mnémonique `HLT`comem synonyme de `JMP 99`.

### Entrées/sorties

Les entrées/sortries sont "mappées" en mémoire.

Modifier la valeur du mot mémoire 99 écrit sur le terminal.

Une valeur saisie sur le terminal pourra être lue dans le mot mémoire
99.

------------------------------------------------------------

# Des projets comparables, et autres liens

 * [CARDboard Illustrative Aid to Computation](https://www.cs.drexel.edu/~bls96/museum/cardiac.html), un processeur en carton des
   années 80.
   - [Un simulateur en Python de la chose](http://www.pythondiary.com/blog/Oct.15,2014/building-cpu-simulator-python.html).
   - [Une implémentation FPGA](http://www.drdobbs.com/embedded-systems/paper-to-fpga/240155922?pgno=1).
 * [Little Man Computer](https://en.wikipedia.org/wiki/Little_man_computer), un autre processeur en carton d'un autre âge.

