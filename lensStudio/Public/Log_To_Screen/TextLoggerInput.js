//@ui {"widget":"group_start", "label":"TextLogger"}

//@input bool loggingEnabled = true {"hint":"Turn this off to easily stop logs from being displayed"}
//@input vec4 textColor = {0,1,0,1} {"widget":"color"}
//@input int logLimit = 4 {"hint":"The max number of logs that can appear onscreen at a time"}
//@input Asset.Material textMaterial {"hint":"The material used for displaying text."}
//@input Component.Camera camera {"label":"Camera(optional)", "hint":"The camera used for text placement. If left blank, the first camera found in a hierarchy search will be used."}

//@ui {"widget":"group_start", "label":"Mesh Assets"}
//@input Asset.RenderMesh mesh_A_upper
//@input Asset.RenderMesh mesh_B_upper
//@input Asset.RenderMesh mesh_C_upper
//@input Asset.RenderMesh mesh_D_upper
//@input Asset.RenderMesh mesh_E_upper
//@input Asset.RenderMesh mesh_F_upper
//@input Asset.RenderMesh mesh_G_upper
//@input Asset.RenderMesh mesh_H_upper
//@input Asset.RenderMesh mesh_I_upper
//@input Asset.RenderMesh mesh_J_upper
//@input Asset.RenderMesh mesh_K_upper
//@input Asset.RenderMesh mesh_L_upper
//@input Asset.RenderMesh mesh_M_upper
//@input Asset.RenderMesh mesh_N_upper
//@input Asset.RenderMesh mesh_O_upper
//@input Asset.RenderMesh mesh_P_upper
//@input Asset.RenderMesh mesh_Q_upper
//@input Asset.RenderMesh mesh_R_upper
//@input Asset.RenderMesh mesh_S_upper
//@input Asset.RenderMesh mesh_T_upper
//@input Asset.RenderMesh mesh_U_upper
//@input Asset.RenderMesh mesh_V_upper
//@input Asset.RenderMesh mesh_W_upper
//@input Asset.RenderMesh mesh_X_upper
//@input Asset.RenderMesh mesh_Y_upper
//@input Asset.RenderMesh mesh_Z_upper
//@input Asset.RenderMesh mesh_0
//@input Asset.RenderMesh mesh_1
//@input Asset.RenderMesh mesh_2
//@input Asset.RenderMesh mesh_3
//@input Asset.RenderMesh mesh_4
//@input Asset.RenderMesh mesh_5
//@input Asset.RenderMesh mesh_6
//@input Asset.RenderMesh mesh_7
//@input Asset.RenderMesh mesh_8
//@input Asset.RenderMesh mesh_9
//@input Asset.RenderMesh mesh__chr_33
//@input Asset.RenderMesh mesh__chr_34
//@input Asset.RenderMesh mesh__chr_35
//@input Asset.RenderMesh mesh__chr_36
//@input Asset.RenderMesh mesh__chr_37
//@input Asset.RenderMesh mesh__chr_38
//@input Asset.RenderMesh mesh__chr_39
//@input Asset.RenderMesh mesh__chr_40
//@input Asset.RenderMesh mesh__chr_41
//@input Asset.RenderMesh mesh__chr_42
//@input Asset.RenderMesh mesh__chr_43
//@input Asset.RenderMesh mesh__chr_44
//@input Asset.RenderMesh mesh__chr_45
//@input Asset.RenderMesh mesh__chr_46
//@input Asset.RenderMesh mesh__chr_47
//@input Asset.RenderMesh mesh__chr_58
//@input Asset.RenderMesh mesh__chr_59
//@input Asset.RenderMesh mesh__chr_60
//@input Asset.RenderMesh mesh__chr_61
//@input Asset.RenderMesh mesh__chr_62
//@input Asset.RenderMesh mesh__chr_63
//@input Asset.RenderMesh mesh__chr_64
//@input Asset.RenderMesh mesh__chr_91
//@input Asset.RenderMesh mesh__chr_92
//@input Asset.RenderMesh mesh__chr_93
//@input Asset.RenderMesh mesh__chr_94
//@input Asset.RenderMesh mesh__chr_95
//@input Asset.RenderMesh mesh__chr_96
//@input Asset.RenderMesh mesh__chr_123
//@input Asset.RenderMesh mesh__chr_124
//@input Asset.RenderMesh mesh__chr_125
//@input Asset.RenderMesh mesh__chr_126
//@input Asset.RenderMesh mesh__chr_9
//@input Asset.RenderMesh mesh__chr_10
//@input Asset.RenderMesh mesh__chr_11
//@input Asset.RenderMesh mesh__chr_12
//@input Asset.RenderMesh mesh__chr_13
//@input Asset.RenderMesh mesh__chr_32
//@ui {"widget":"group_end"}
//@ui {"widget":"group_end"}


script._charLookup = {
	'A': { mesh:script.mesh_A_upper, size: [0.634765625, 1.259765625]},
	'B': { mesh:script.mesh_B_upper, size: [0.634765625, 1.259765625]},
	'C': { mesh:script.mesh_C_upper, size: [0.634765625, 1.259765625]},
	'D': { mesh:script.mesh_D_upper, size: [0.634765625, 1.259765625]},
	'E': { mesh:script.mesh_E_upper, size: [0.634765625, 1.259765625]},
	'F': { mesh:script.mesh_F_upper, size: [0.634765625, 1.259765625]},
	'G': { mesh:script.mesh_G_upper, size: [0.634765625, 1.259765625]},
	'H': { mesh:script.mesh_H_upper, size: [0.634765625, 1.259765625]},
	'I': { mesh:script.mesh_I_upper, size: [0.634765625, 1.259765625]},
	'J': { mesh:script.mesh_J_upper, size: [0.634765625, 1.259765625]},
	'K': { mesh:script.mesh_K_upper, size: [0.634765625, 1.259765625]},
	'L': { mesh:script.mesh_L_upper, size: [0.634765625, 1.259765625]},
	'M': { mesh:script.mesh_M_upper, size: [0.634765625, 1.259765625]},
	'N': { mesh:script.mesh_N_upper, size: [0.634765625, 1.259765625]},
	'O': { mesh:script.mesh_O_upper, size: [0.634765625, 1.259765625]},
	'P': { mesh:script.mesh_P_upper, size: [0.634765625, 1.259765625]},
	'Q': { mesh:script.mesh_Q_upper, size: [0.634765625, 1.259765625]},
	'R': { mesh:script.mesh_R_upper, size: [0.634765625, 1.259765625]},
	'S': { mesh:script.mesh_S_upper, size: [0.634765625, 1.259765625]},
	'T': { mesh:script.mesh_T_upper, size: [0.634765625, 1.259765625]},
	'U': { mesh:script.mesh_U_upper, size: [0.634765625, 1.259765625]},
	'V': { mesh:script.mesh_V_upper, size: [0.634765625, 1.259765625]},
	'W': { mesh:script.mesh_W_upper, size: [0.634765625, 1.259765625]},
	'X': { mesh:script.mesh_X_upper, size: [0.634765625, 1.259765625]},
	'Y': { mesh:script.mesh_Y_upper, size: [0.634765625, 1.259765625]},
	'Z': { mesh:script.mesh_Z_upper, size: [0.634765625, 1.259765625]},
	'0': { mesh:script.mesh_0, size: [0.634765625, 1.259765625]},
	'1': { mesh:script.mesh_1, size: [0.634765625, 1.259765625]},
	'2': { mesh:script.mesh_2, size: [0.634765625, 1.259765625]},
	'3': { mesh:script.mesh_3, size: [0.634765625, 1.259765625]},
	'4': { mesh:script.mesh_4, size: [0.634765625, 1.259765625]},
	'5': { mesh:script.mesh_5, size: [0.634765625, 1.259765625]},
	'6': { mesh:script.mesh_6, size: [0.634765625, 1.259765625]},
	'7': { mesh:script.mesh_7, size: [0.634765625, 1.259765625]},
	'8': { mesh:script.mesh_8, size: [0.634765625, 1.259765625]},
	'9': { mesh:script.mesh_9, size: [0.634765625, 1.259765625]},
	'!': { mesh:script.mesh__chr_33, size: [0.634765625, 1.259765625]},
	'"': { mesh:script.mesh__chr_34, size: [0.634765625, 1.259765625]},
	'#': { mesh:script.mesh__chr_35, size: [0.634765625, 1.259765625]},
	'$': { mesh:script.mesh__chr_36, size: [0.634765625, 1.259765625]},
	'%': { mesh:script.mesh__chr_37, size: [0.634765625, 1.259765625]},
	'&': { mesh:script.mesh__chr_38, size: [0.634765625, 1.259765625]},
	"'": { mesh:script.mesh__chr_39, size: [0.634765625, 1.259765625]},
	'(': { mesh:script.mesh__chr_40, size: [0.634765625, 1.259765625]},
	')': { mesh:script.mesh__chr_41, size: [0.634765625, 1.259765625]},
	'*': { mesh:script.mesh__chr_42, size: [0.634765625, 1.259765625]},
	'+': { mesh:script.mesh__chr_43, size: [0.634765625, 1.259765625]},
	',': { mesh:script.mesh__chr_44, size: [0.634765625, 1.259765625]},
	'-': { mesh:script.mesh__chr_45, size: [0.634765625, 1.259765625]},
	'.': { mesh:script.mesh__chr_46, size: [0.634765625, 1.259765625]},
	'/': { mesh:script.mesh__chr_47, size: [0.634765625, 1.259765625]},
	':': { mesh:script.mesh__chr_58, size: [0.634765625, 1.259765625]},
	';': { mesh:script.mesh__chr_59, size: [0.634765625, 1.259765625]},
	'<': { mesh:script.mesh__chr_60, size: [0.634765625, 1.259765625]},
	'=': { mesh:script.mesh__chr_61, size: [0.634765625, 1.259765625]},
	'>': { mesh:script.mesh__chr_62, size: [0.634765625, 1.259765625]},
	'?': { mesh:script.mesh__chr_63, size: [0.634765625, 1.259765625]},
	'@': { mesh:script.mesh__chr_64, size: [0.634765625, 1.259765625]},
	'[': { mesh:script.mesh__chr_91, size: [0.634765625, 1.259765625]},
	'\\': { mesh:script.mesh__chr_92, size: [0.634765625, 1.259765625]},
	']': { mesh:script.mesh__chr_93, size: [0.634765625, 1.259765625]},
	'^': { mesh:script.mesh__chr_94, size: [0.634765625, 1.259765625]},
	'_': { mesh:script.mesh__chr_95, size: [0.634765625, 1.259765625]},
	'`': { mesh:script.mesh__chr_96, size: [0.634765625, 1.259765625]},
	'{': { mesh:script.mesh__chr_123, size: [0.634765625, 1.259765625]},
	'|': { mesh:script.mesh__chr_124, size: [0.634765625, 1.259765625]},
	'}': { mesh:script.mesh__chr_125, size: [0.634765625, 1.259765625]},
	'~': { mesh:script.mesh__chr_126, size: [0.634765625, 1.259765625]},
	'\t': { mesh:script.mesh__chr_9, size: [0.634765625, 1.259765625]},
	'\n': { mesh:script.mesh__chr_10, size: [0.634765625, 1.259765625]},
	'\x0b': { mesh:script.mesh__chr_11, size: [0.634765625, 1.259765625]},
	'\x0c': { mesh:script.mesh__chr_12, size: [0.634765625, 1.259765625]},
	'\r': { mesh:script.mesh__chr_13, size: [0.634765625, 1.259765625]},
	' ': { mesh:script.mesh__chr_32, size: [0.634765625, 1.259765625]},
	'a': { mesh:script.mesh_A_upper, size: [0.634765625, 1.259765625]},
	'b': { mesh:script.mesh_B_upper, size: [0.634765625, 1.259765625]},
	'c': { mesh:script.mesh_C_upper, size: [0.634765625, 1.259765625]},
	'd': { mesh:script.mesh_D_upper, size: [0.634765625, 1.259765625]},
	'e': { mesh:script.mesh_E_upper, size: [0.634765625, 1.259765625]},
	'f': { mesh:script.mesh_F_upper, size: [0.634765625, 1.259765625]},
	'g': { mesh:script.mesh_G_upper, size: [0.634765625, 1.259765625]},
	'h': { mesh:script.mesh_H_upper, size: [0.634765625, 1.259765625]},
	'i': { mesh:script.mesh_I_upper, size: [0.634765625, 1.259765625]},
	'j': { mesh:script.mesh_J_upper, size: [0.634765625, 1.259765625]},
	'k': { mesh:script.mesh_K_upper, size: [0.634765625, 1.259765625]},
	'l': { mesh:script.mesh_L_upper, size: [0.634765625, 1.259765625]},
	'm': { mesh:script.mesh_M_upper, size: [0.634765625, 1.259765625]},
	'n': { mesh:script.mesh_N_upper, size: [0.634765625, 1.259765625]},
	'o': { mesh:script.mesh_O_upper, size: [0.634765625, 1.259765625]},
	'p': { mesh:script.mesh_P_upper, size: [0.634765625, 1.259765625]},
	'q': { mesh:script.mesh_Q_upper, size: [0.634765625, 1.259765625]},
	'r': { mesh:script.mesh_R_upper, size: [0.634765625, 1.259765625]},
	's': { mesh:script.mesh_S_upper, size: [0.634765625, 1.259765625]},
	't': { mesh:script.mesh_T_upper, size: [0.634765625, 1.259765625]},
	'u': { mesh:script.mesh_U_upper, size: [0.634765625, 1.259765625]},
	'v': { mesh:script.mesh_V_upper, size: [0.634765625, 1.259765625]},
	'w': { mesh:script.mesh_W_upper, size: [0.634765625, 1.259765625]},
	'x': { mesh:script.mesh_X_upper, size: [0.634765625, 1.259765625]},
	'y': { mesh:script.mesh_Y_upper, size: [0.634765625, 1.259765625]},
	'z': { mesh:script.mesh_Z_upper, size: [0.634765625, 1.259765625]},
};


script.getCharConfig = function(char){
    return script._charLookup[char];
}

script.getCharMesh = function(char){
    var config = script.getCharConfig(char);
    if(!config){ return null; }
    return config.mesh;
}

script.getCharSize = function(char){
    var config = script.getCharConfig(char);
    if(!config){ return null; }
    return config.size;
}
