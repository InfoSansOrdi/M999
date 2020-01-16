/**
 * Expressions régulières aidant à la compilation
 */
// Fin de ligne; commentaire
var TRAIL = "\\s*(;.*)?";
// Nombre
var NBR = "([0-9]+)";
// ID de label
var ID = "([a-zA-Z][a-zA-Z0-9_]*)";
// Instructions
var OPC = "(\\.word|STR|LDA|LDB|MOV|ADD|SUB|JMP|JPP|JEQ|JNE)";
// Ligne vide
var EMPTY = new RegExp("^"+TRAIL+"$");
// Opérateur contenant une adresse (et donc potentiellement un label)
var OPADDR = new RegExp("^\\s*(JMP|JPP|JEQ|JNE|LDA|LDB|STR)\\s+"+ID+TRAIL+"$");
// STR, LDA ou LDB
var LDSTR = new RegExp("^\\s*(LDA|LDB|STR)\\s+"+ID+TRAIL+"$");
// Label, ".at *label*"
var LABS = new RegExp("^\\s*\\.at\\s+"+ID+TRAIL+"$");
// Adressage direct, ".at X", X = [0,99]
var DIREC = new RegExp("^\\s*\\.at\\s+"+NBR+TRAIL+"$");
// Instruction
var INS = new RegExp("^\\s*"+OPC +"(\\s+("+ID+"|"+NBR+"|"+NBR+"\\s+"+NBR+"))?"+TRAIL+"$");
// Donnée
var DAT = new RegExp("^\\s*"+NBR+TRAIL+"$");

/**
 * Tableau de correspondance instruction -> code
 */

    var insCode = {
    "STR": "0",
    "LDA": "1",
    "LDB": "2",
    "MOV": "3",
    "ADD": "4",
    "SUB": "4",
    "JMP": "5",
    "JPP": "6",
    "JEQ": "7",
    "JNE": "8"
};

/**
 * Passage de l'asm labélisé à l'asm absolu (sans label)
 * Résolution des adresses correspondantes aux labels
 */
function asmtoasm() {
    // Éléments de la page
    var sourcetext = document.getElementById('asm_lbl');
    var outSourceText = document.getElementById('asm_asm');
    var src = sourcetext.value.split('\n');
    var log = document.getElementById('log');

    // Si la source est vide, pas de code à changer
    if (src.length === 0)
        return;

    // Lignes avec labels résolus
    var out = [];
    // Bloc d'instructions courant
    var cellsTmp = [];
    // État de la mémoire (occupation, vrai si une case mémoire i est libre)
    var freeOut = Array(100).fill(true);
    // Correspondances labels / adresses
    var labls = new Map();
    // Taille du bloc courant
    var tmpSize = 0;
    // Adresse de début du bloc courant
    var begAddr = 0;

    // Présence dans un bloc d'adressage direct vs adressage labelisé
    var inDirec = true; // Vrai puisqu'on suppose un ".at 0"

    // Dépassement mémoire...
    var fatalError = false;

    log.innerHTML = "Compilation ASM vers ASM...(labelisation)<br>";

    // 1er parcours du code pour réserver les blocs adressés directement
    for(var nline = 0; nline < src.length; ++nline) {
        var line = src[nline];
        
        if (line.match(LABS)) {
            inDirec = false;
        } else if (line.match(DIREC)) { // Si c'est une adresse directe

            // Mise à jour l'occupation mémoire
            inDirec = true;

            var addr = line.match(DIREC)[1];

            tmpSize = 0;
            begAddr = parseInt(addr);

            if (addr < 0 || addr > 99) {
                log.innerHTML += errMessage("asmtoasm", nline+1, "Addresse " + addr + " hors de la mémoire<br>");
                fatalError = true;
            }
            
        } else { // Autre chose que un ".at ..." (une instruction / un commentaire)
            if (!line.match(EMPTY) && inDirec) { // Si la ligne est une instruction ou une donnée (probablement)
                if (freeOut[begAddr + tmpSize])
                    freeOut[begAddr + tmpSize] = false;
                else {
                    log.innerHTML += errMessage("asmtoasm", nline+1, "Addresse " + (begAddr + tmpSize) + " déjà occupée<br>");
                    fatalError = true;
                }
                tmpSize++;
            }
        }
    }

    tmpSize = 0;
    inDirec = true;

    // 2ème parcours du code pour trouver un adressage direct pour les labels
    for(var nline = 0; nline < src.length; ++nline) {
        var line = src[nline];

        // Si un bloc label doit être placé et que c'est un ".at ..." ou qu'on en est à la dernière ligne
        if (!inDirec && (nline == (src.length - 1) || line.match(LABS) || line.match(DIREC))) {
            // Recherche d'une place en mémoire
            // Si la ligne est une instruction et qu'on en est à la dernière ligne, il faut rajouter 1 à la taille du bloc
            if (nline == (src.length - 1) && line.match(INS))
                ++tmpSize;

            if (tmpSize != 0) {
                var freeAddr = 0;
                var found = false;

                while(!found && freeAddr < 100) {
                    var nbFreeCells;
                    if (freeOut[freeAddr]) { // C'est une adresse libre
                        // Vérifier que le bloc libre peut contenir le bloc courant
                        for (nbFreeCells = 1; nbFreeCells < tmpSize; ++nbFreeCells) {
                            // Si on est en dehors de la mémoire ou que la case mémoire n'est pas libre, le bloc ne passe pas
                            if (freeAddr + nbFreeCells > 99 || !freeOut[freeAddr + nbFreeCells])
                                break;
                        }

                        // Si on a trouvé une taille de bloc suffisante
                        if (nbFreeCells >= tmpSize)
                            found = true;
                        else { // Bloc trop petit, recherche d'un autre bloc libre
                            freeAddr += nbFreeCells;
                        }
                    } else
                        ++freeAddr;
                }

                // Bloc libre trouvé -> Écrire le ".at [freeAddr]" résolu, reset le block courant et mettre à jour l'occupation
                if (found) {
                    labls.set(labl, freeAddr);
                    freeOut.fill(false, freeAddr, freeAddr+tmpSize);
                } else { // Pas de bloc libre trouvé -> Erreur
                    log.innerHTML += errMessage("asmtoasm", nline+1, "Label " + labl + " impossible à placer en mémoire<br>");
                    fatalError = true;
                }
                
            }

            tmpSize = 0;
        }
        
        if (line.match(LABS)) {
            inDirec = false;
            var labl = line.match(LABS)[1];

            if (labls.has(labl)) {
                log.innerHTML += errMessage("asmtoasm", nline+1, "Label " + labl + " déjà utilisé<br>");
                fatalError = true;
            }
        } else if (line.match(DIREC)) { // Si c'est une adresse directe
            inDirec = true;
        } else { // Autre chose que un ".at ..." (une instruction / un commentaire)
            if (!line.match(EMPTY)) { // Si la ligne est une instruction ou une donnée (probablement)
                tmpSize++;
            }
        } 
    }

    // Dernier parcours du code, écrire le code résultat en remplaçant les labels par leurs adresses
    for(var nline = 0; nline < src.length; ++nline) {
        var line = src[nline];

        if (line.match(OPADDR)) {
            var labl = line.match(OPADDR)[2];

            if (labls.has(labl)) {
                line = line.replace(labl, labls.get(labl));	
            } else {
                log.innerHTML += errMessage("asmtoasm", nline+1, "Label " + labl + " inconnu<br>");
                fatalError = true;
            }
        } else if (line.match(LABS)) {
            var labl = line.match(LABS)[1];
            line = line.replace(labl, labls.get(labl));
        }

        out[nline] = line;
    }

    if (!fatalError) {
        outSourceText.value = out.join("\n");
        log.innerHTML = "ASM délabélisé";
    }
}

/**
 * Compilation de l'asm absolu (pas de label) en représentation numérique
 * (Récupération des sources depuis la textarea "asm_asm", la traduire et l'écrire dans la textarea "bin")
 */
function asmtobin() {
    // Éléments de la page
    var sourcetext = document.getElementById('asm_asm');
    var bintext = document.getElementById('bin')
    var src = sourcetext.value.split('\n');
    var log = document.getElementById('log');

    // Lignes compilées
    var out = [];

    // instruction illégale | paramètre incorrect
    var fatalError = false;
    // Adresse courante
    var curAddr = 0;

    log.innerHTML = "Compilation ASM vers BIN...<br>";

    // Parcours du code
    for(var nline = 0; nline < src.length; ++nline) {
        var line = src[nline];
        
        var lineRegex;
        if (line.match(EMPTY)) { // ligne vide
            out[nline] = "";
        } else if (lineRegex = line.match(DIREC)) { // La ligne est sous la forme ".at xx"
            addr = parseInt(lineRegex[1]);
            out[nline] = line;
            if (addr < 0 || addr > 99) {
                log.innerHTML += errMessage("asmtobin", nline+1, "Addresse hors de la mémoire<br>");
                fatalError = true;
            }
        } else if (line.match(LABS)) { // Les labels sont résolus dans l'autre source ASM 
            log.innerHTML += errMessage("asmtobin", nline+1, "Labels interdits ici<br>")
            fatalError = true;
        } else if (lineRegex = line.match(INS)) { // La ligne est une instruction
            var ins = asmtobin_instr(lineRegex);
            if (ins == "I") {
                log.innerHTML += errMessage("asmtobin", nline+1, "Instruction '" + lineRegex[1] + "' non reconnue<br>");
                fatalError = true;
            } else if (ins == "T") {
                log.innerHTML += errMessage("asmtobin", nline+1, "Trop de paramètre<br>");
                fatalError = true;
            }  else if (ins == "M") {
                log.innerHTML += errMessage("asmtobin", nline+1, "Pas assez paramètre<br>");
                fatalError = true;
            } else if (ins == "P") {
                log.innerHTML += errMessage("asmtobin", nline+1, "Paramètre incorrect<br>");
                fatalError = true;
            } else {
                out[nline] = ins;
            }
        } else if (line.match(DAT)) {
            out[nline] = line;
        }

        if (!fatalError) {
            bin.value = out.join("\n");
            log.innerHTML = "ASM vers BIN compilé";
        }

    }
}

/**
 * Traduction du tableau "instruction" (résultant de l'expression régulière) vers la forme x y z (représentation numérique)
 * Retourne "N" si l'instruction n'est pas reconnu, "P" si les paramètres passés sont incorrects
 */
function asmtobin_instr(insRegexLin) {
    if (insRegexLin[1] == "ADD" || insRegexLin[1] == "SUB") { // Instructions sans paramètre
        if (typeof insRegexLin[2] !== 'undefined')
            return "T";
        return insRegexLin[1] == "ADD" ? "400" : "401";

    } else if (insRegexLin[1] == "STR" || // Instructions avec un paramètre
                insRegexLin[1] == "LDA" ||
                insRegexLin[1] == "LDB" ||
                insRegexLin[1] == "JMP" ||
                insRegexLin[1] == "JPP" ||
                insRegexLin[1] == "JEQ" ||
                insRegexLin[1] == "JNE") {
        if (typeof insRegexLin[2] === 'undefined') // Pas de paramètre donné
            return "M";
        // Suppression des espaces
        insRegexLin[3] = insRegexLin[3].replace(/\s/g, '');
        if (insRegexLin[3].length < 2) // Si l'adresse est sur un chiffre, rajout d'un 0
            insRegexLin[3] = '0' + insRegexLin[3];
        else if (insRegexLin[3].length > 2) // Taille de l'adresse > 2, paramètre incorrect
            return "P";
        return insCode[insRegexLin[1]] + insRegexLin[3];
    } else if (insRegexLin[1] == "MOV") { // Instructions avec 2 paramètres
        // Suppression des espaces
        insRegexLin[3] = insRegexLin[3].replace(/\s/g, '');
        if (insRegexLin[3].length < 2) // Si pas exactement 2 paramètres de donnés
            return "M";
        else if (insRegexLin[3].length > 2)
            return "T";
        return insCode[insRegexLin[1]] + insRegexLin[3];
    }
    // Instruction non reconnue
    return "I";
}

/**
 * Retourne une chaîne de caractère formatée pour les erreurs
 */
function errMessage(srcArea, nline, msg) {
    return "Erreur dans " + srcArea + "; ligne " + nline + ": " + msg;
}