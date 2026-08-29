export interface ChangeSpecification {
    operation: 'ADD' | 'REMOVE' | 'MODIFY' | 'RENAME' | 'REPLACE';
    target: {
      name: string;
      type: 'component' | 'service' | 'function' | 'config' | 'infrastructure' | 'unknown';
    };
    property?: string;
    replacement?: string;
    contextBoundary?: string;
    changeSemantics: string[];
}

export function parseChangeDescription(description: string): ChangeSpecification {
    const desc = description.trim();
    const lowerDesc = desc.toLowerCase();

    const spec: ChangeSpecification = {
        operation: 'MODIFY',
        target: { name: '', type: 'unknown' },
        changeSemantics: [],
    };

    const determineType = (name: string, desc: string, hasParens: boolean = false) => {
        if (hasParens) return 'function';
        
        const lowerName = name.toLowerCase();
        const lowerDesc = desc.toLowerCase();
        
        if (lowerName.includes('redis') || lowerName.includes('kafka') || lowerName.includes('database') || lowerName.includes('publisher')) return 'infrastructure';
        if (lowerName.includes('component') || new RegExp(`${name}\\s+component`, 'i').test(desc)) return 'component';
        if (lowerName.includes('service') || new RegExp(`${name}\\s+service`, 'i').test(desc)) return 'service';
        if (lowerName.includes('helper') || lowerName.includes('function') || lowerName.includes('method') || new RegExp(`${name}\\s+(?:helper|function|method)`, 'i').test(desc)) return 'function';
        if (lowerName.includes('timeout') || lowerName.includes('config') || new RegExp(`${name}\\s+(?:config|client)`, 'i').test(desc)) return 'config';
        
        // Fallback checks on full description if name itself isn't obvious
        if (lowerDesc.includes('component')) return 'component';
        if (lowerDesc.includes('service')) return 'service';
        if (lowerDesc.includes('redis') || lowerDesc.includes('kafka')) return 'infrastructure';
        if (lowerDesc.includes('client') || lowerDesc.includes('api')) return 'config';
        
        return 'unknown';
    };

    const applyTarget = (rawName: string) => {
        const hasParens = rawName.endsWith('()');
        const clean = rawName.replace(/\(\)$/, '');
        
        // If it looks like a file extension rather than a member expression, treat it as a single file target
        if (clean.match(/\.(js|ts|tsx|jsx|json|md|html|css|scss|sass|less|xml|yml|yaml|go|py|rs|c|cpp|h|hpp|rb|php|swift|kt|java|class)$/i)) {
            spec.target.name = clean;
            spec.target.type = 'unknown'; // don't try to infer function from parens on a file
            return;
        }

        if (clean.includes('.')) {
            const parts = clean.split('.');
            spec.target.name = parts.pop()!;
            if (!spec.contextBoundary) {
                spec.contextBoundary = parts.pop()!;
            }
        } else {
            spec.target.name = clean;
        }
        spec.target.type = determineType(spec.target.name, desc, hasParens || desc.includes(`${spec.target.name}()`));
    };

    // 2. Semantics mapping
    if (lowerDesc.includes('async')) spec.changeSemantics.push('async');
    if (lowerDesc.includes('handler') || lowerDesc.includes('prop')) spec.changeSemantics.push('props', 'handler');
    if (lowerDesc.includes('legacy') || lowerDesc.includes('deprecation')) spec.changeSemantics.push('legacy', 'deprecation');
    if (lowerDesc.includes('event') || lowerDesc.includes('publisher') || lowerDesc.includes('kafka')) spec.changeSemantics.push('event', 'message-broker');
    if (lowerDesc.includes('timeout') || lowerDesc.includes('client') || lowerDesc.includes('network')) spec.changeSemantics.push('network', 'configuration');
    if (lowerDesc.includes('color') || lowerDesc.includes('style') || lowerDesc.includes('css') || lowerDesc.includes('classname')) spec.changeSemantics.push('style', 'visual');
    if (lowerDesc.includes('doc') || lowerDesc.includes('readme') || lowerDesc.includes('documentation')) spec.changeSemantics.push('documentation');

    // 3. Regex Patterns for Operations
    const ident = `([a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9_-]+)*(?:\\(\\))?)`;

    // QUALIFIED MEMBER EXPRESSION MODIFY
    const memberModifyRegex = new RegExp(`(?:modify|change|update)\\s+(?:the\\s+)?${ident}(?:.*?change(?: its)?\\s+([a-zA-Z0-9_-]+)\\s+(?:behavior|handler|prop|type|logic|action))?`, 'i');
    const memberModifyMatch = desc.match(memberModifyRegex);
    if (memberModifyMatch) {
        spec.operation = 'MODIFY';
        applyTarget(memberModifyMatch[1]);
        if (memberModifyMatch[2]) {
            spec.property = memberModifyMatch[2];
        }
        
        // Safety check: If it was a file extension, we don't treat the regex property match as valid unless it explicitly says 'property' or 'handler'
        // For example: "Modify router.js to change its middleware behavior" shouldn't flag "middleware" as a property
        if (memberModifyMatch[1].match(/\.(js|ts|tsx|jsx|json|md|html|css|scss|sass|less|xml|yml|yaml|go|py|rs|c|cpp|h|hpp|rb|php|swift|kt|java|class)$/i)) {
            spec.property = undefined;
        }
        
        return spec;
    }

    // RENAME
    const renameRegex = new RegExp(`(?:rename|change name of)\\s+(?:a\\s+)?(?:private\\s+)?(?:the\\s+)?${ident}(?:\\s+(?:helper|function|component|service|module))?\\s+to\\s+${ident}`, 'i');
    const renameMatch = desc.match(renameRegex);
    if (renameMatch) {
        spec.operation = 'RENAME';
        applyTarget(renameMatch[1]);
        
        let rep = renameMatch[2].replace(/\(\)$/, '');
        if (rep.includes('.')) {
            rep = rep.split('.').pop()!;
        }
        spec.replacement = rep;
        
        spec.changeSemantics.push('refactor', 'naming');
        return spec;
    }
    
    const renameTargetOnly = new RegExp(`(?:rename|change name of)\\s+(?:a\\s+)?(?:private\\s+)?(?:the\\s+)?${ident}(?:\\s+(?:helper|function|component|service|module))?`, 'i');
    const renameMatchOnly = desc.match(renameTargetOnly);
    if (renameMatchOnly && !renameMatch) {
        spec.operation = 'RENAME';
        applyTarget(renameMatchOnly[1]);
        spec.changeSemantics.push('refactor', 'naming');
        return spec;
    }

    // REPLACE
    const replaceRegex = new RegExp(`(?:replace|swap)\\s+(?:the\\s+)?${ident}(?:.*?)?(?:in\\s+([a-zA-Z0-9_-]+)\\s+)?with\\s+${ident}`, 'i');
    const replaceMatch = desc.match(replaceRegex);
    if (replaceMatch) {
        spec.operation = 'REPLACE';
        applyTarget(replaceMatch[1]);
        if (replaceMatch[2] && replaceMatch[2] !== 'with') {
            spec.contextBoundary = replaceMatch[2];
        }
        spec.replacement = replaceMatch[3].replace(/\(\)$/, '');
        return spec;
    }

    // REMOVE
    const removeRegex = new RegExp(`(?:remove|delete|drop)\\s+(?:the\\s+)?(?:legacy\\s+)?${ident}`, 'i');
    const removeMatch = desc.match(removeRegex);
    if (removeMatch) {
        spec.operation = 'REMOVE';
        applyTarget(removeMatch[1]);
        return spec;
    }

    // MODIFY PROPERTY A's B
    const modifyPropRegex = new RegExp(`(?:modify|change|update)\\s+(?:the\\s+)?${ident}(?:.*?)'s\\s+([a-zA-Z0-9_-]+)`, 'i');
    const modifyPropMatch = desc.match(modifyPropRegex);
    if (modifyPropMatch) {
        spec.operation = 'MODIFY';
        applyTarget(modifyPropMatch[1]);
        spec.property = modifyPropMatch[2];
        return spec;
    }

    // MODIFY ... PROPERTY
    const modifyGeneralPropRegex = new RegExp(`(?:modify|change|update)\\s+(?:the\\s+)?${ident}\\s+(?:.*?)([a-zA-Z0-9_-]+)\\s+(?:property|handler|method|attribute)`, 'i');
    const modifyGeneralPropMatch = desc.match(modifyGeneralPropRegex);
    if (modifyGeneralPropMatch) {
        spec.operation = 'MODIFY';
        applyTarget(modifyGeneralPropMatch[1]);
        if (modifyGeneralPropMatch[2] !== 'the' && modifyGeneralPropMatch[2] !== 'component') {
            spec.property = modifyGeneralPropMatch[2];
        }
        return spec;
    }

    // MODIFY TYPE/PROP
    const modifyTypeRegex = /(?:modify|change|update).*?\b([A-Z][a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*(?:\(\))?)\b.*?\b([a-zA-Z0-9_]+)\b\s*(?:type|prop|handler)/;
    const modifyTypeMatch = desc.match(modifyTypeRegex);
    if (modifyTypeMatch && modifyTypeMatch[1] !== 'API') {
        spec.operation = 'MODIFY';
        applyTarget(modifyTypeMatch[1]);
        spec.property = modifyTypeMatch[2];
        return spec;
    }

    // CONFIG/INCREASE
    const configRegex = new RegExp(`(?:increase|decrease|change|modify|set)\\s+(?:the\\s+)?(?:default\\s+)?([a-zA-Z0-9_-]+)\\s+(?:in|for|on)(?:\\s+the)?\\s+${ident}\\s+(?:api\\s+client|service|component)?\\s+to\\s+(.+)`, 'i');
    const configMatch = desc.match(configRegex);
    if (configMatch) {
        spec.operation = 'MODIFY';
        spec.property = configMatch[1];
        applyTarget(configMatch[2]);
        spec.replacement = configMatch[3].replace(/\.$/, '');
        return spec;
    }

    // ADD
    const addRegex = new RegExp(`(?:add|insert|create)\\s+(?:the\\s+)?${ident}(?:.*?)?(?:to|in)\\s+([a-zA-Z0-9_-]+)`, 'i');
    const addMatch = desc.match(addRegex);
    if (addMatch) {
        spec.operation = 'ADD';
        applyTarget(addMatch[1]);
        spec.contextBoundary = addMatch[2];
        return spec;
    }

    // FALLBACK
    const words = desc.replace(/[^a-zA-Z0-9 _.-]/g, '').split(' ');
    const stopWords = ['replace', 'change', 'update', 'modify', 'delete', 'remove', 'with', 'component', 'openui', 'the', 'and', 'in', 'to', 'for', 'a', 'an'];
    const targetWord = words.find(w => w.length > 3 && !stopWords.includes(w.toLowerCase())) || words[0];
    
    applyTarget(targetWord);
    return spec;
}
