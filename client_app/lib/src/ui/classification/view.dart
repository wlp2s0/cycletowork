import 'package:cycletowork/src/data/app_data.dart';
import 'package:cycletowork/src/theme.dart';
import 'package:cycletowork/src/ui/classification_cyclist/view.dart';
import 'package:cycletowork/src/ui/classification_department/view.dart';
import 'package:cycletowork/src/ui/dashboard/view_model.dart';
import 'package:cycletowork/src/ui/classification_company/view.dart';
import 'package:cycletowork/src/widget/progress_indicator.dart';
import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

class ClassificationView extends StatefulWidget {
  const ClassificationView({super.key});

  @override
  State<ClassificationView> createState() => _ClassificationViewState();
}

class _ClassificationViewState extends State<ClassificationView> {
  @override
  Widget build(BuildContext context) {
    var scale = context.read<AppData>().scale;
    final viewModel = Provider.of<ViewModel>(context);
    var textTheme = Theme.of(context).textTheme;
    var colorScheme = Theme.of(context).colorScheme;
    final colorSchemeExtension =
        Theme.of(context).extension<ColorSchemeExtension>()!;

    var listChallengeRegistred = viewModel.uiState.listChallengeRegistred;
    var registeredToChalleng = listChallengeRegistred.isNotEmpty;
    List<String> listChallengeName =
        listChallengeRegistred.map((e) => e.challengeName).toList();

    var challengeRegistrySelected = viewModel.uiState.challengeRegistrySelected;
    var userCompanyClassification = viewModel.uiState.userCompanyClassification;
    var userCyclistClassification = viewModel.uiState.userCyclistClassification;
    var userDepartmentClassification =
        viewModel.uiState.userDepartmentClassification;
    var hasDepartment = challengeRegistrySelected != null &&
        challengeRegistrySelected.departmentName != '';
    var isEmptyDepartment =
        hasDepartment && userDepartmentClassification == null;
    var refreshClassificationLoading =
        viewModel.uiState.refreshClassificationLoading;

    if (refreshClassificationLoading &&
        (!registeredToChalleng ||
            userCompanyClassification == null ||
            userCyclistClassification == null ||
            isEmptyDepartment)) {
      return const Scaffold(
        body: Center(
          child: AppProgressIndicator(),
        ),
      );
    }

    if (!registeredToChalleng ||
        userCompanyClassification == null ||
        userCyclistClassification == null ||
        isEmptyDepartment) {
      return const _EmptyChallenge();
    }

    return DefaultTabController(
      initialIndex: 0,
      length: hasDepartment ? 3 : 2,
      child: Scaffold(
        appBar: AppBar(
          centerTitle: true,
          toolbarHeight: 90.0 * scale,
          title: Column(
            children: [
              SizedBox(
                height: 10 * scale,
              ),
              Text(
                'Classifica',
                style: textTheme.headlineSmall,
              ),
              DropdownButton<String>(
                items: listChallengeName.map((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(
                      value,
                      style: textTheme.bodySmall,
                    ),
                  );
                }).toList(),
                value: challengeRegistrySelected?.challengeName,
                onChanged: (value) {
                  if (value != null) {
                    // viewModel.set
                  }
                },
              )
            ],
          ),
          bottom: TabBar(
            indicatorColor: colorScheme.primary,
            unselectedLabelStyle: textTheme.bodySmall!.copyWith(
              fontWeight: FontWeight.w500,
            ),
            unselectedLabelColor: colorSchemeExtension.textSecondary,
            labelColor: colorSchemeExtension.textPrimary,
            labelStyle: textTheme.bodySmall!.copyWith(
              fontWeight: FontWeight.w500,
            ),
            tabs: <Widget>[
              Tab(
                text: 'Aziende'.toUpperCase(),
              ),
              if (hasDepartment)
                Tab(
                  text: 'Sedi / dip.'.toUpperCase(),
                ),
              Tab(
                text: 'Ciclisti'.toUpperCase(),
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: <Widget>[
            const ClassificationCompanyView(),
            if (hasDepartment) const DepartmentClassificationView(),
            const CyclistCompanyView(),
          ],
        ),
      ),
    );
  }
}

class _EmptyChallenge extends StatelessWidget {
  const _EmptyChallenge();

  @override
  Widget build(BuildContext context) {
    var scale = context.read<AppData>().scale;
    var colorScheme = Theme.of(context).colorScheme;
    var textTheme = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Column(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height: 10.0 * scale,
          ),
          Center(
            child: Text(
              'Classifica',
              style: textTheme.headlineSmall,
            ),
          ),
          SizedBox(
            height: 30.0 * scale,
          ),
          Container(
            height: (MediaQuery.of(context).size.height / 3) * 2 * scale,
            margin: EdgeInsets.symmetric(horizontal: 24.0 * scale),
            padding: EdgeInsets.only(left: 23.0 * scale, right: 19.0 * scale),
            decoration: BoxDecoration(
              color: colorScheme.primary,
              borderRadius: BorderRadius.circular(20.0 * scale),
            ),
            child: Center(
              child: Text(
                'La classifica è disponibile soltanto se partecipi a una challenge.',
                style: textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
            ),
          )
        ],
      ),
    );
  }
}
