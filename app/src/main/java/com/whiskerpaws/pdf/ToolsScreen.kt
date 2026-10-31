package com.whiskerpaws.pdf

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.io.File

@Composable
fun ToolsScreen(vm: MainViewModel) {
    val docs by vm.docs.collectAsStateWithLifecycle()
    var tool by rememberSaveable { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf(listOf<String>()) } // file names, in tap order

    Column(Modifier.fillMaxSize()) {
        TabRow(selectedTabIndex = tool) {
            listOf("Merge", "Split", "Compress").forEachIndexed { i, title ->
                Tab(selected = tool == i, onClick = { tool = i; selected = emptyList() }, text = { Text(title) })
            }
        }
        when (tool) {
            0 -> MergeTool(vm, docs, selected) { selected = it }
            1 -> SplitTool(vm, docs, selected) { selected = it }
            else -> CompressTool(vm, docs, selected) { selected = it }
        }
    }
}

@Composable
private fun MergeTool(vm: MainViewModel, docs: List<File>, selected: List<String>, onChange: (List<String>) -> Unit) {
    Column(Modifier.fillMaxSize()) {
        Text(
            "Tap files in the order you want them combined. Free: up to ${UsageLimiter.FREE_MERGE_LIMIT} files.",
            Modifier.padding(16.dp), style = MaterialTheme.typography.bodyMedium
        )
        DocPicker(docs, selected, multi = true, onChange = onChange, modifier = Modifier.weight(1f))
        Button(
            onClick = {
                val files = selected.mapNotNull { n -> docs.firstOrNull { it.name == n } }
                vm.merge(files); onChange(emptyList())
            },
            enabled = selected.size >= 2,
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) { Text("Merge ${selected.size} files") }
    }
}

@Composable
private fun SplitTool(vm: MainViewModel, docs: List<File>, selected: List<String>, onChange: (List<String>) -> Unit) {
    val file = docs.firstOrNull { it.name == selected.firstOrNull() }
    var pages by remember(file?.name) { mutableIntStateOf(0) }
    var from by remember(file?.name) { mutableStateOf("1") }
    var to by remember(file?.name) { mutableStateOf("") }

    LaunchedEffect(file?.name) {
        pages = file?.let { vm.pageCount(it) } ?: 0
        if (pages > 0) to = pages.toString()
    }
    val f = from.toIntOrNull()
    val t = to.toIntOrNull()
    val valid = file != null && f != null && t != null && f >= 1 && t >= f && t <= pages

    Column(Modifier.fillMaxSize()) {
        Text("Pick one PDF, then choose the page range to extract.", Modifier.padding(16.dp))
        DocPicker(docs, selected, multi = false, onChange = onChange, modifier = Modifier.weight(1f))
        if (file != null) {
            Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(from, { from = it.filter(Char::isDigit) }, label = { Text("From") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.weight(1f))
                OutlinedTextField(to, { to = it.filter(Char::isDigit) }, label = { Text("To") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.weight(1f))
                Text("of $pages")
            }
        }
        Button(
            onClick = { vm.split(file!!, f!!, t!!); onChange(emptyList()) },
            enabled = valid,
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) { Text("Extract pages") }
    }
}

@Composable
private fun CompressTool(vm: MainViewModel, docs: List<File>, selected: List<String>, onChange: (List<String>) -> Unit) {
    val file = docs.firstOrNull { it.name == selected.firstOrNull() }
    var level by remember { mutableStateOf(CompressLevel.MEDIUM) }

    Column(Modifier.fillMaxSize()) {
        Text(
            "Pick one PDF. Compression turns pages into images, so text will no longer be selectable.",
            Modifier.padding(16.dp)
        )
        DocPicker(docs, selected, multi = false, onChange = onChange, modifier = Modifier.weight(1f))
        Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            CompressLevel.entries.forEach { l ->
                FilterChip(
                    selected = level == l, onClick = { level = l },
                    label = { Text(if (l == CompressLevel.HIGH) "${l.label} (Pro)" else l.label) }
                )
            }
        }
        Button(
            onClick = { vm.compress(file!!, level); onChange(emptyList()) },
            enabled = file != null,
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) { Text("Compress") }
    }
}

@Composable
private fun DocPicker(
    docs: List<File>,
    selected: List<String>,
    multi: Boolean,
    onChange: (List<String>) -> Unit,
    modifier: Modifier = Modifier
) {
    if (docs.isEmpty()) {
        Box(modifier.fillMaxWidth(), Alignment.Center) { Text("Scan or import PDFs first.") }
        return
    }
    LazyColumn(modifier) {
        items(docs, key = { it.name }) { f ->
            val checked = f.name in selected
            Row(
                Modifier.fillMaxWidth()
                    .clickable {
                        onChange(
                            when {
                                !multi -> listOf(f.name)
                                checked -> selected - f.name
                                else -> selected + f.name
                            }
                        )
                    }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (multi) Checkbox(checked, null) else RadioButton(checked, null)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(f.name, style = MaterialTheme.typography.titleSmall)
                    Text("${f.length() / 1024} KB", style = MaterialTheme.typography.bodySmall)
                }
                if (multi && checked) Text("#${selected.indexOf(f.name) + 1}", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}
