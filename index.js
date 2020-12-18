module.exports = function ReplacerSkill(mod) {
	const GAME = mod.game
	let SKILLS = reloadModule('./skills.js')
	let Enabled = true
	
	let job = -1
	
	mod.command.add("rs", () => {
		Enabled = !Enabled
		mod.command.message("Enabled " + Enabled)
	})
	
	mod.command.add("reload", () => {
		SKILLS = reloadModule('./skills.js')
	})
	
	GAME.on('enter_game', () => {
		job = (GAME.me.templateId - 10101) % 100
	})
	
	GAME.on('leave_game', () => {
		job = -1
	})
	
	mod.hook('C_START_SKILL', 7, { order: -100 }, event => {
		if (!Enabled) return
		var replaceSkill = SKILLS.find(obj => obj.job==job && obj.group==Math.floor(event.skill.id/10000))
		if (!replaceSkill || !replaceSkill.enabled || !replaceSkill.instance) return
		
		event.skill.id = replaceSkill.replace
		StartInstanceSkill(event)
		return false
	})

	mod.hook('S_ABNORMALITY_BEGIN', 4, event => {
        if(event.id==100801){
            SKILLS.find(obj => obj.job==job && obj.group==Math.floor(290900/10000)).replace = 370130 //BD 290900
            SKILLS.find(obj => obj.job==job && obj.group==Math.floor(40900/10000)).replace = 360130 //RB 40900 
        }
    })

    mod.hook('S_ABNORMALITY_END', 1, event => {
        if(event.id==100801){
            SKILLS.find(obj => obj.job==job && obj.group==Math.floor(290900/10000)).replace = 290930 //BD
            SKILLS.find(obj => obj.job==job && obj.group==Math.floor(40900/10000)).replace = 40930 //RB   
        }
    })
	
	function StartInstanceSkill(event) {
		mod.send('C_START_INSTANCE_SKILL', 7, {
			skill:     event.skill,
			loc:       event.loc,
			w:         event.w,
			continue:  event.continue,
			targets:   [{arrowId: 0, gameId: event.target, hitCylinderId: 0}],
			endpoints: [event.dest]
		})
	}
	
	mod.hook('C_START_COMBO_INSTANT_SKILL', 6, { order: -100 }, event => {
		if (!Enabled) return
		var replaceSkill = SKILLS.find(obj => obj.job==job && obj.group==Math.floor(event.skill.id/10000))
		if (!replaceSkill || !replaceSkill.enabled || !replaceSkill.combo) return
		
		event.skill.id = replaceSkill.replace
		return true
	})
	
	mod.hook('S_ACTION_END', 5, event => {
		var replaceSkill = SKILLS.find(obj => obj.job==job && obj.replace==event.skill.id)
		if (!replaceSkill || !replaceSkill.enabled || !replaceSkill.autoRepeat) return
		
		StartInstanceSkill(event)
		return false
	})
	
	function reloadModule(fileName) {
		delete require.cache[require.resolve(fileName)]
		console.log('Replacer-Skill: Reloading ' + fileName)
		mod.command.message("Reloading: " + fileName)
		return require(fileName)
	}
	
}
